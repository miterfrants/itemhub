using System;
using System.Threading.Tasks.Dataflow;
using System.Collections.Generic;
using Homo.Core.Constants;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class CheckLastOnlinePipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public CheckLastOnlinePipeline(long id, long pipelineId, long ownerId, string DBConnectionString, bool isHead, bool isEnd, bool isVIP, string rawData)
        {
            ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(async previous =>
                            {
                                System.Console.WriteLine($"check last online:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }

                                CheckLastOnlinePipelinePayload payload = ValidateAndGetPayload(rawData);

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

                                    var last = DeviceActivityLogDataservice.GetLast(iotDbContext, ownerId, payload.DeviceId);
                                    var diff = (System.DateTime.Now - last.CreatedAt).TotalMinutes;
                                    if (
                                        (diff > payload.Minutes && payload.Operator == TRIGGER_OPERATOR.B) ||
                                        (diff >= payload.Minutes && payload.Operator == TRIGGER_OPERATOR.BE) ||
                                        (diff < payload.Minutes && payload.Operator == TRIGGER_OPERATOR.L) ||
                                        (diff <= payload.Minutes && payload.Operator == TRIGGER_OPERATOR.LE) ||
                                        (diff == payload.Minutes && payload.Operator == TRIGGER_OPERATOR.E)
                                    )
                                    {
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

                                    PipelineExecuteLogDataservice.Create(iotDbContext, ownerId, new DTOs.PipelineExecuteLog()
                                    {
                                        IsHead = isHead,
                                        IsEnd = isEnd,
                                        PipelineId = pipelineId,
                                        ItemId = id,
                                        Raw = rawData
                                    });
                                    return false;
                                }

                            });
        }

        public static CheckLastOnlinePipelinePayload ValidateAndGetPayload(string rawData)
        {
            if (System.String.IsNullOrEmpty(rawData))
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_PAYLOAD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            var payload = Newtonsoft.Json.JsonConvert.DeserializeObject<CheckLastOnlinePipelinePayload>(rawData);

            if (payload == null)
            {
                throw new CustomException(
                    ERROR_CODE.PIPELINE_INVALID_PAYLOAD, System.Net.HttpStatusCode.BadRequest,
                    new Dictionary<string, string> { { "reason", "Check last online activity payload error" } }
                );
            }

            return Newtonsoft.Json.JsonConvert.DeserializeObject<CheckLastOnlinePipelinePayload>(rawData);
        }
    }

    public class CheckLastOnlinePipelinePayload
    {
        public long DeviceId { get; set; }
        public TRIGGER_OPERATOR Operator { get; set; }
        public int Minutes { get; set; }
    }

}