using System;
using System.Threading.Tasks.Dataflow;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
namespace Homo.IotApi
{
    public class SwitchPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public SwitchPipeline(long id, long pipelineId, long ownerId, string DBConnectionString, bool isHead, bool isEnd, bool isVIP, string rawData, List<MqttPublisher> localMqttPublishers, string mqttUsername, string mqttPassword)
        {
            CheckSwitchPipeline.ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(previous =>
                            {
                                System.Console.WriteLine($"switch:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
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

                                    SystemConfig localMqttPublisherEndpoints = SystemConfigDataservice.GetOne(iotDbContext, SYSTEM_CONFIG.LOCAL_MQTT_PUBLISHER_ENDPOINTS);
                                    MqttPublisherHelper.Connect(localMqttPublisherEndpoints.Value, localMqttPublishers, mqttUsername, mqttPassword);
                                    DeviceSwitchHelper.Update(iotDbContext, ownerId, payload.DeviceId.GetValueOrDefault(), payload.Pin, new DTOs.DevicePinSwitchValue { Value = payload.Status.GetValueOrDefault() }, localMqttPublishers);
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
    }
}