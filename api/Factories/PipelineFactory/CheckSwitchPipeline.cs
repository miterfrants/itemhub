using System;
using System.Threading.Tasks.Dataflow;
using Newtonsoft.Json;
using Homo.Core.Constants;
using Microsoft.EntityFrameworkCore;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public class CheckSwitchPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public CheckSwitchPipeline(long id, long pipelineId, long ownerId, string DBConnectionString, bool isHead, bool isEnd, bool isVIP, string rawData)
        {
            CheckSwitchPipeline.ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(previous =>
                            {
                                System.Console.WriteLine($"check switch:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }

                                var payload = CheckSwitchPipeline.ValidateAndGetPayload(rawData);

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

                                    var pin = DevicePinDataservice.GetOne(iotDbContext, ownerId, payload.DeviceId.GetValueOrDefault(), PIN_TYPE.SWITCH, payload.Pin);
                                    if (pin.Value == payload.Status)
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

        public static SwitchPipelinePayload ValidateAndGetPayload(string rawData)
        {
            if (System.String.IsNullOrEmpty(rawData))
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_PAYLOAD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            var payload = JsonConvert.DeserializeObject<SwitchPipelinePayload>(rawData);
            if (payload.DeviceId == null)
            {
                throw new CustomException(ERROR_CODE.SWITCH_PIPELINE_INVALID_PAYLOAD_DEVICE_ID_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            if (System.String.IsNullOrEmpty(payload.Pin))
            {
                throw new CustomException(ERROR_CODE.SWITCH_PIPELINE_INVALID_PAYLOAD_PIN_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.Status == null)
            {
                throw new CustomException(ERROR_CODE.SWITCH_PIPELINE_INVALID_PAYLOAD_STATUS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            return payload;
        }
    }

    public class SwitchPipelinePayload
    {
        public long? DeviceId { get; set; }
        public string Pin { get; set; }

        public int? Status { get; set; }
    }
}