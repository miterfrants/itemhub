using MQTTnet;
using System.Collections.Generic;

namespace Homo.IotApi
{

    public class DeviceSwitchHelper
    {
        public static void Update(IotDbContext iotDbContext, long ownerId,
            long deviceId, string pin, DTOs.DevicePinSwitchValue dto, List<MqttPublisher> localMqttPublishers
            )
        {
            // http
            DevicePinDataservice.UpdateValueByDeviceId(iotDbContext, ownerId, deviceId, pin, dto.Value);

            // mqtt
            localMqttPublishers.ForEach(publisher =>
            {
                publisher.Client.PublishAsync(new MqttApplicationMessageBuilder()
                    .WithTopic($"{deviceId}/{pin}/switch")
                    .WithPayload(
                        Newtonsoft.Json.JsonConvert.SerializeObject(
                            new DTOs.DevicePinSwitchValue { Value = dto.Value }
                        )
                    )
                    .Build());
            });
        }
    }
}