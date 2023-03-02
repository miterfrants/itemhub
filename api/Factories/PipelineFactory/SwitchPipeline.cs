using System.Threading.Tasks.Dataflow;
using System.Collections.Generic;

namespace Homo.IotApi
{
    public class SwitchPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public SwitchPipeline(IotDbContext dbContext, long ownerId, string rawData, List<MqttPublisher> localMqttPublishers, string mqttUsername, string mqttPassword)
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
                                SystemConfig localMqttPublisherEndpoints = SystemConfigDataservice.GetOne(dbContext, SYSTEM_CONFIG.LOCAL_MQTT_PUBLISHER_ENDPOINTS);
                                MqttPublisherHelper.Connect(localMqttPublisherEndpoints.Value, localMqttPublishers, mqttUsername, mqttPassword);
                                DeviceSwitchHelper.Update(dbContext, ownerId, payload.DeviceId.GetValueOrDefault(), payload.Pin, new DTOs.DevicePinSwitchValue { Value = payload.Status.GetValueOrDefault() }, localMqttPublishers);
                                return true;
                            });
        }
    }
}