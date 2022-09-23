using MQTTnet.Client;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Cryptography.X509Certificates;
using System.Security.Authentication;

namespace Homo.IotApi
{

    public class MqttBrokerHelper
    {
        public static Task<MqttClientConnectResult> Connect(MQTTnet.Client.MqttClient broker, string mqttUsername, string mqttPassword
            )
        {
            if (broker.IsConnected)
            {
                return Task.Run(() =>
                {
                    return new MqttClientConnectResult();
                });
            }
            var mqttClientOptions = new MqttClientOptionsBuilder()
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
                                var ca = new X509Certificate("secrets/chain.crt");

                            }))
                            .WithCredentials(mqttUsername, mqttPassword)
                            .WithCleanSession()
                            .Build();

            return broker.ConnectAsync(mqttClientOptions, CancellationToken.None);
        }
    }
}