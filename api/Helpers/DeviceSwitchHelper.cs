using MQTTnet.Client;
using MQTTnet;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Cryptography.X509Certificates;
using System.Linq;
using System.Collections.Generic;
using System.Security.Authentication;

namespace Homo.IotApi
{

    public class DeviceSwitchHelper
    {
        public static async Task Update(IotDbContext iotDbContext, long ownerId,
            long deviceId, string pin, DTOs.DevicePinSwitchValue dto, MQTTnet.Client.MqttClient mqttBroker
            )
        {
            // http
            DevicePinDataservice.UpdateValueByDeviceId(iotDbContext, ownerId, deviceId, pin, dto.Value);

            // mqtt
            // await mqttBroker.PublishAsync(new MqttApplicationMessageBuilder()
            //     .WithTopic($"{deviceId}/{pin}/switch")
            //     .WithPayload(
            //         Newtonsoft.Json.JsonConvert.SerializeObject(
            //             new DTOs.DevicePinSwitchValue { Value = dto.Value }
            //         )
            //     )
            //     .Build());

        }
    }
}