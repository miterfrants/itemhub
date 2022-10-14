using MQTTnet;
using MQTTnet.Client;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using System.Security.Authentication;
using System.Linq;

namespace Homo.IotApi
{

    public class MqttPublisherHelper
    {
        public static void Connect(List<MqttPublisher> localMqttPublishers, string mqttUsername, string mqttPassword
            )
        {
            string localMqttEndpoints = "[{\"id\": \"self\", \"ip\": \"127.0.0.1\"}]";
            List<MqttEndpoint> mqttEndpoints = Newtonsoft.Json.JsonConvert.DeserializeObject<List<MqttEndpoint>>(localMqttEndpoints);
            List<string> localMqttPublishersIds = localMqttPublishers.Select(x => x.Id).ToList<string>();
            List<MqttClientConnectResult> result = new List<MqttClientConnectResult>();
            // new clients
            mqttEndpoints.Where(x => !localMqttPublishersIds.Contains(x.Id)).ToList<MqttEndpoint>()
                .ForEach(endpoint =>
                {
                    var mqttClientOptions = new MqttClientOptionsBuilder()
                                    .WithTcpServer(endpoint.IP, 8883)
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
                    MQTTnet.Client.MqttClient client = (MQTTnet.Client.MqttClient)new MqttFactory().CreateMqttClient();
                    Task<MqttClientConnectResult> result = client.ConnectAsync(mqttClientOptions, CancellationToken.None);
                    result.Wait();
                    localMqttPublishers.Add(new MqttPublisher()
                    {
                        IP = endpoint.IP,
                        Id = endpoint.Id,
                        Client = client
                    });
                });

            // check client connected 
            localMqttPublishers.ForEach(async publisher =>
            {
                if (!publisher.Client.IsConnected)
                {
                    var mqttClientOptions = new MqttClientOptionsBuilder()
                                    .WithTcpServer(publisher.IP, 8883)
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
                    Task<MqttClientConnectResult> result = publisher.Client.ConnectAsync(mqttClientOptions, CancellationToken.None);
                    result.Wait();
                }
            });
        }
        public static void Disconnect(List<MqttPublisher> localMqttPublishers)
        {
            localMqttPublishers.ForEach(publisher =>
            {
                if (publisher.Client.IsConnected)
                {

                    var result = publisher.Client.DisconnectAsync();
                    result.Wait();
                }
            });
        }
    }

    public class MqttPublisher
    {
        public string Id { get; set; }
        public string IP { get; set; }
        public MQTTnet.Client.MqttClient Client { get; set; }
    }

    public class MqttEndpoint
    {
        public string Id { get; set; }
        public string IP { get; set; }
    }
}