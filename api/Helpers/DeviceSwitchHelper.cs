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
            long deviceId, string pin, DTOs.DevicePinSwitchValue dto, string mqttUsername, string mqttPassword
            )
        {
            // http
            DevicePinDataservice.UpdateValueByDeviceId(iotDbContext, ownerId, deviceId, pin, dto.Value);

            // mqtt
            var options = new MqttClientOptionsBuilder()
                .WithTcpServer("127.0.0.1", 8883)
                .WithClientId("api-server")
                .WithTls((options =>
                {
                    options.UseTls = true;
                    options.SslProtocol = SslProtocols.Tls12;
                    options.CertificateValidationHandler = (o) =>
                    {
                        return true;
                    };
                    var certificate = new X509Certificate("secrets/mqtt-server.pfx");
                    var ca = new X509Certificate("secrets/mqtt-root-ca.crt");
                    options.Certificates = new List<X509Certificate>() { certificate, ca };

                }))
                .WithCredentials(mqttUsername, mqttPassword)
                .WithCleanSession()
                .Build();

            MQTTnet.Client.MqttClient client = (MQTTnet.Client.MqttClient)new MqttFactory().CreateMqttClient();
            await client.ConnectAsync(options, CancellationToken.None);
            await client.PublishAsync(new MqttApplicationMessageBuilder()
                .WithTopic($"{deviceId}/{pin}/switch")
                .WithPayload(
                    Newtonsoft.Json.JsonConvert.SerializeObject(
                        new DTOs.DevicePinSwitchValue { Value = dto.Value }
                    )
                )
                .Build());

        }
    }
}