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
        // API Server 每一台都是一個 Publisher 也是 Broker, 
        // 所以當它收到 device 送來的 publish message 他會當中繼的 publisher 把他的訊息送到附近的所有 API server(broker)
        // 這些 broker 再把資料廣播到訂閱的 device 上
        // 這個 Connect function 是在每一次 device 送 publish message 都確保每一台 api server 之間有建立好 mqtt connection

        public static void Connect(string localMqttPublisherEndpointsRaw, List<MqttPublisher> localMqttPublishers, string mqttUsername, string mqttPassword
            )
        {
            List<MqttEndpoint> mqttEndpoints = Newtonsoft.Json.JsonConvert.DeserializeObject<List<MqttEndpoint>>(localMqttPublisherEndpointsRaw);
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
                                        options.Certificates = new List<X509Certificate>() { certificate, ca };
                                    }))
                                    .WithCredentials(mqttUsername, mqttPassword)
                                    .WithCleanSession()
                                    .Build();
                    MQTTnet.Client.MqttClient client = (MQTTnet.Client.MqttClient)new MqttFactory().CreateMqttClient();
                    MqttPublisher publisher = new MqttPublisher()
                    {
                        IP = endpoint.IP,
                        Id = endpoint.Id,
                        Client = client
                    };
                    client.ConnectingAsync += e =>
                    {
                        publisher.IsDisconnected = false;
                        publisher.IsConnecting = true;
                        return Task.CompletedTask;
                    };
                    client.ConnectedAsync += e =>
                    {
                        publisher.IsConnecting = false;
                        return Task.CompletedTask;
                    };
                    client.DisconnectedAsync += e =>
                    {
                        publisher.IsDisconnected = true;
                        return Task.CompletedTask;
                    };

                    if (client.IsConnected || publisher.IsConnecting)
                    {
                        return;
                    }
                    Task<MqttClientConnectResult> result = client.ConnectAsync(mqttClientOptions, CancellationToken.None);


                    try
                    {
                        result.Wait();
                    }
                    catch (System.Exception ex)
                    {
                        System.Console.WriteLine($"Mqtt Error: {endpoint.IP}: {ex.ToString()}");
                    }

                    // 多個 request 過來的時候可能會並行的發生, 所以這邊要再多做一個判斷避免 localMqttPublishers 中間有沒連線的 mqtt client

                    if (client.IsConnected && localMqttPublishers.Where(x => x.Id == endpoint.Id).Count() == 0)
                    {
                        System.Console.WriteLine($"testing: {publisher.Id}  {publisher.IP}  {Newtonsoft.Json.JsonConvert.SerializeObject("mqtt connected", Newtonsoft.Json.Formatting.Indented)}");
                        localMqttPublishers.Add(publisher);
                    }
                    else
                    {
                        System.Console.WriteLine($"testing: {publisher.Id}  {publisher.IP}  {Newtonsoft.Json.JsonConvert.SerializeObject("mqtt already connected run disconnect and dispose", Newtonsoft.Json.Formatting.Indented)}");
                        client.DisconnectAsync();
                        client.Dispose();
                    }
                });

            // check client connected 
            localMqttPublishers.ForEach(publisher =>
            {
                if (!publisher.Client.IsConnected && !publisher.IsConnecting)
                {
                    System.Console.WriteLine($"testing: {publisher.Id}  {publisher.IP}  {Newtonsoft.Json.JsonConvert.SerializeObject("mqtt exists and status is not connectd and connecting", Newtonsoft.Json.Formatting.Indented)}");
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
                                        options.Certificates = new List<X509Certificate>() { certificate, ca };

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
        public bool IsConnecting { get; set; }
        public bool IsDisconnected { get; set; }
    }

    public class MqttEndpoint
    {
        public string Id { get; set; }
        public string IP { get; set; }
    }
}