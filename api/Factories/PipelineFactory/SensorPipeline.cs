using System;
using System.Threading.Tasks.Dataflow;
using Newtonsoft.Json;
using Homo.Core.Constants;
using Microsoft.EntityFrameworkCore;


namespace Homo.IotApi
{
    public class SensorPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public SensorPipeline(long id, long pipelineId, long ownerId, string DBConnectionString, bool isHead, bool isEnd, bool isVIP, string rawData)
        {
            ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(previous =>
                            {
                                System.Console.WriteLine($"sensor:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }

                                var payload = ValidateAndGetPayload(rawData);

                                DbContextOptionsBuilder<IotDbContext> IotDbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
                                var mysqlVersion = new MySqlServerVersion(new Version(8, 0, 25));
                                IotDbContextBuilder.UseMySql(DBConnectionString, mysqlVersion);
                                using (var iotDbContext = new IotDbContext(IotDbContextBuilder.Options))
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

                                    decimal? categorizedValue = SensorLogDataservice.GetAggregateValue(iotDbContext, ownerId, payload.DeviceId.GetValueOrDefault(), payload.Pin, payload.StaticMethod.GetValueOrDefault(), 1, payload.LastRows.GetValueOrDefault());
                                    if (
                                        categorizedValue != null && (
                                        payload.Operator == TRIGGER_OPERATOR.B && categorizedValue > payload.Threshold
                                        || payload.Operator == TRIGGER_OPERATOR.BE && categorizedValue >= payload.Threshold
                                        || payload.Operator == TRIGGER_OPERATOR.E && categorizedValue == payload.Threshold
                                        || payload.Operator == TRIGGER_OPERATOR.L && categorizedValue < payload.Threshold
                                        || payload.Operator == TRIGGER_OPERATOR.LE && categorizedValue <= payload.Threshold
                                        )
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
                                    return false;
                                }
                            });
        }

        public static SensorPipelinePayload ValidateAndGetPayload(string rawData)
        {
            if (System.String.IsNullOrEmpty(rawData))
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_PAYLOAD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            var payload = JsonConvert.DeserializeObject<SensorPipelinePayload>(rawData);
            if (payload.DeviceId == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_DEVICE_ID_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            if (System.String.IsNullOrEmpty(payload.Pin))
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_PIN_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.LastRows == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_LAST_ROWS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.StaticMethod == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_STATIC_METHOD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.Operator == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_OPERATOR_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.Threshold == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_THRESHOLD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            return payload;
        }

    }

    public class SensorPipelinePayload
    {
        public long? DeviceId { get; set; }
        public string Pin { get; set; }

        public int? LastRows { get; set; }
        public PIPELINE_DEVICE_STATISTICAL_METHODS? StaticMethod { get; set; }
        public TRIGGER_OPERATOR? Operator { get; set; }
        public decimal? Threshold { get; set; }
    }
}