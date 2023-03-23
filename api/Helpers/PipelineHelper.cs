using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Homo.Core.Constants;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class PipelineHelper
    {
        public static PipelineItem GetHead(List<PipelineItem> pipelineItems, List<PipelineConnector> pipelineConnectors)
        {
            var destIds = pipelineConnectors.Select(item => item.DestPipelineItemId).ToList<long>();
            var sourceItems = pipelineItems.Where(item => !destIds.Contains(item.Id)).ToList<PipelineItem>();
            // pipeline 不允許有兩個頭
            if (sourceItems.Count > 1)
            {
                throw new CustomException(ERROR_CODE.PIPELINE_COULD_NOT_ALLOW_MULTIPLE_HEAD, System.Net.HttpStatusCode.BadRequest);
            }
            // pipeline 不允許沒有頭
            if (sourceItems.Count == 0)
            {
                throw new CustomException(ERROR_CODE.PIPELINE_COULD_NOT_ALLOW_WITHOUT_HEAD, System.Net.HttpStatusCode.BadRequest);
            }
            return sourceItems[0];
        }

        public static List<PipelineItem> GetEnds(PipelineItem head, List<PipelineItem> pipelineItems, List<PipelineConnector> pipelineConnectors)
        {
            var sourceIds = pipelineConnectors.Select(item => item.SourcePipelineItemId).ToList<long>();
            var ends = pipelineItems.Where(item => !sourceIds.Contains(item.Id) && item.Id != head.Id).ToList<PipelineItem>();
            return ends;
        }

        public static void Validate(List<PipelineItem> pipelineItems, List<PipelineConnector> pipelineConnectors)
        {
            // validate
            // pipeline head 不能是 NOTIFICATION, DELAY, SWITCH, NETWORK
            var head = PipelineHelper.GetHead(pipelineItems, pipelineConnectors);
            if (
                head.ItemType == PIPELINE_ITEM_TYPE.NOTIFICATION
                || head.ItemType == PIPELINE_ITEM_TYPE.DELAY
                || head.ItemType == PIPELINE_ITEM_TYPE.SWITCH
                || head.ItemType == PIPELINE_ITEM_TYPE.NETWORK
            )
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_HEAD_TYPE, System.Net.HttpStatusCode.BadRequest);
            }

            // NOTIFICATION, SWITCH, SCHEDULE 不能出現在中間
            var endIds = GetEnds(head, pipelineItems, pipelineConnectors).Select(x => x.Id);
            var notInEnds = pipelineItems.Where(x =>
                (
                    x.ItemType == PIPELINE_ITEM_TYPE.NOTIFICATION
                    || x.ItemType == PIPELINE_ITEM_TYPE.SWITCH
                    || x.ItemType == PIPELINE_ITEM_TYPE.SCHEDULE
                ) && !endIds.Contains(x.Id) && x.Id != head.Id
            );

            if (notInEnds.Count() > 0)
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_ITEM_TYPE_IN_MID, System.Net.HttpStatusCode.BadRequest);
            }

            if (pipelineItems.Where(x => x.ItemType == PIPELINE_ITEM_TYPE.SCHEDULE && endIds.Contains(x.Id)).Count() > 0)
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_TYPE_SCHEDULE_IN_END, System.Net.HttpStatusCode.BadRequest);
            }
        }

        public static async void Execute(
            string serverId,
            long pipelineId,
            List<PipelineItem> pipelineItems,
            List<PipelineConnector> pipelineConnectors,
            long ownerId,
            bool isVIP,
            List<MqttPublisher> localMqttPublishers,
            string mqttUsername,
            string mqttPassword,
            string smsUsername,
            string smsPassword,
            string smsUrl,
            string sendGridApiKey,
            string mailTemplatePath,
            string systemEmail,
            string dbc,
            bool isForceRun = false
            )
        {
            await Task.Delay(0);
            DbContextOptionsBuilder<IotDbContext> IotDbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
            var mysqlVersion = new MySqlServerVersion(new Version(8, 0, 25));
            IotDbContextBuilder.UseMySql(dbc, mysqlVersion);
            using (var iotDbContext = new IotDbContext(IotDbContextBuilder.Options))
            {
                var pipeline = PipelineDataservice.GetOne(iotDbContext, ownerId, pipelineId, true);
                // schedule pipeline 當下 isRun 會是 false, 所以需要 isForceRun 不管當前的
                if (!pipeline.IsRun && isForceRun == false)
                {
                    return;
                }
                PipelineDataservice.Occupy(iotDbContext, pipelineId, serverId);
                await Task.Delay(5000);


                pipeline = PipelineDataservice.GetOne(iotDbContext, ownerId, pipelineId, true);
                if (pipeline.LockBy != serverId)
                {
                    return;
                }

                PipelineHelper.Validate(pipelineItems, pipelineConnectors);
                Dictionary<long, IPropagatorBlock<bool, bool>> blocks = new Dictionary<long, IPropagatorBlock<bool, bool>>();
                var pipelineHead = PipelineHelper.GetHead(pipelineItems, pipelineConnectors);
                var pipelineEnd = PipelineHelper.GetEnds(pipelineHead, pipelineItems, pipelineConnectors);
                var pipelineFactory = new PipelineFactory();
                pipelineItems.ForEach(item =>
                {
                    bool isHead = pipelineHead.Id == item.Id;
                    bool isEnd = pipelineEnd.Where(x => x.Id == item.Id).Count() > 0;
                    var block = pipelineFactory.getPipeline(serverId, item.ItemType, item.Id, pipelineId, ownerId, dbc, isHead, isEnd, isVIP, item.Value, localMqttPublishers, mqttUsername, mqttPassword, smsUsername, smsPassword, smsUrl, sendGridApiKey, mailTemplatePath, systemEmail).block;
                    if (block == null)
                    {
                        throw new CustomException(ERROR_CODE.NOT_ALLOW_PIPELINE_TYPE, System.Net.HttpStatusCode.BadRequest);
                    }
                    blocks.Add(item.Id, block);
                });


                // 整理 pipeline 連線資料,串接 tranform block
                var linkOptions = new DataflowLinkOptions { PropagateCompletion = true };
                var connectionDictionary = new Dictionary<long, List<long>>();
                pipelineConnectors.ForEach(connection =>
                {
                    if (connectionDictionary.ContainsKey(connection.SourcePipelineItemId))
                    {
                        connectionDictionary[connection.SourcePipelineItemId].Add(connection.DestPipelineItemId);
                    }
                    else
                    {
                        connectionDictionary[connection.SourcePipelineItemId] = new List<long>() { connection.DestPipelineItemId };
                    }
                });

                // 串接 transform block 但 .net 不允許 1個 transform block 對應多個 transform block 所以在這邊如果發現目標超過兩個需要
                // 中繼的 broadcast block
                connectionDictionary.Keys.ToList().ForEach(sourcePipelineItemId =>
                {
                    if (connectionDictionary[sourcePipelineItemId].Count() == 1)
                    {
                        var nextBlock = blocks[connectionDictionary[sourcePipelineItemId][0]];
                        blocks[sourcePipelineItemId].LinkTo(nextBlock, new DataflowLinkOptions { PropagateCompletion = true });
                    }
                    else if (connectionDictionary[sourcePipelineItemId].Count() >= 2)
                    {
                        var broadcastBlock = new BroadcastBlock<bool>(result => result);
                        blocks[sourcePipelineItemId].LinkTo(broadcastBlock, new DataflowLinkOptions { PropagateCompletion = true });
                        connectionDictionary[sourcePipelineItemId].ForEach(destPipelineItemId =>
                        {
                            var nextBlock = blocks[destPipelineItemId];
                            broadcastBlock.LinkTo(nextBlock, new DataflowLinkOptions { PropagateCompletion = true });
                        });
                    }
                });

                // 開始執行
                blocks[pipelineHead.Id].Post(
                    true
                );
            }

        }
    }

}