using System;
using System.Threading.Tasks.Dataflow;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Homo.Core.Constants;

namespace Homo.IotApi
{
    public class OfflinePipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public OfflinePipeline(long id, long pipelineId, long ownerId, string DBConnectionString, bool isHead, bool isEnd, bool isVIP, string rawData, List<MqttPublisher> localMqttPublishers, string mqttUsername, string mqttPassword)
        {
            OfflinePipeline.ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(previous =>
                            {
                                System.Console.WriteLine($"offline:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }
                                var payload = OfflinePipeline.ValidateAndGetPayload(rawData);
                                DbContextOptionsBuilder<IotDbContext> dbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
                                var mysqlVersion = new MySqlServerVersion(new Version(8, 0, 25));
                                dbContextBuilder.UseMySql(DBConnectionString, mysqlVersion);
                                using (var iotDbContext = new IotDbContext(dbContextBuilder.Options))
                                {
                                    if (!isVIP && isHead && RateLimitDataservice.IsPipelineExecuteLogOverPricingPlan(iotDbContext, ownerId, pipelineId))
                                    {
                                        PipelineExecuteLogDataservice.Create(iotDbContext, ownerId, new DTOs.PipelineExecuteLog()
                                        {
                                            IsHead = isHead,
                                            IsEnd = isEnd,
                                            PipelineId = pipelineId,
                                            ItemId = id,
                                            Raw = rawData,
                                            Message = "Over Subscription"
                                        });
                                        return false;
                                    }

                                    var device = DeviceDataservice.GetOne(iotDbContext, ownerId, payload.DeviceId.GetValueOrDefault());
                                    if (device.Online)
                                    {
                                        return false;
                                    }
                                    PipelineExecuteLogDataservice.Create(iotDbContext, ownerId, new DTOs.PipelineExecuteLog()
                                    {
                                        IsHead = isHead,
                                        IsEnd = isEnd,
                                        PipelineId = pipelineId,
                                        ItemId = id,
                                        Raw = rawData
                                    });
                                    return true;
                                }

                            });
        }
        public static OfflinePipelinePayload ValidateAndGetPayload(string rawData)
        {
            if (System.String.IsNullOrEmpty(rawData))
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_PAYLOAD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            var payload = JsonConvert.DeserializeObject<OfflinePipelinePayload>(rawData);
            return payload;
        }
    }


    public class OfflinePipelinePayload
    {
        public long? DeviceId { get; set; }

    }
}