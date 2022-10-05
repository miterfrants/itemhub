using System;
using System.Linq;
using System.Threading.Tasks;
using Homo.Api;
using System.Collections.Generic;
using Homo.Core.Helpers;
using Homo.AuthApi;
using MQTTnet.Client;
using MQTTnet.Server;
using MQTTnet.Protocol;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Threading;
using System.Security.Cryptography.X509Certificates;
using System.Security.Authentication;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    [Route("v1/mqtt")]
    [ApiExplorerSettings(IgnoreApi = true)]
    [Validate]
    public class MqttController
    {
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly IotDbContext _iotDbContext;
        private readonly DBContext _dbContext;
        private readonly string _dbc;
        private readonly string _jwtKey;
        private readonly MQTTnet.AspNetCore.MqttHostedServer _mqttHostedServer;
        private readonly string _mqttUsername;
        private readonly string _mqttPassword;
        private MQTTnet.Client.MqttClient _mqttBroker;
        private readonly string _systemEmail;
        private readonly string _sendGridApiKey;
        private readonly string _staticPath;
        private readonly string _webSiteUrl;
        private readonly string _adminEmail;
        private readonly string _smsUsername;
        private readonly string _smsPassword;
        private readonly string _smsClientUrl;


        public MqttController(IOptions<AppSettings> optionAppSettings, MQTTnet.AspNetCore.MqttHostedServer mqttHostedServer, Homo.Api.CommonLocalizer commonLocalizer, MQTTnet.Client.MqttClient mqttBroker)
        {
            AppSettings settings = optionAppSettings.Value;
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));

            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            DbContextOptionsBuilder<DBContext> dbContextBuilder = new DbContextOptionsBuilder<DBContext>();
            iotBuilder.UseMySql(optionAppSettings.Value.Secrets.DBConnectionString, serverVersion);
            _iotDbContext = new IotDbContext(iotBuilder.Options);
            _dbContext = new DBContext(dbContextBuilder.Options);
            _jwtKey = optionAppSettings.Value.Secrets.JwtKey;

            var secrets = optionAppSettings.Value.Secrets;
            var common = optionAppSettings.Value.Common;

            _mqttHostedServer = mqttHostedServer;
            _mqttUsername = optionAppSettings.Value.Secrets.MqttUsername;
            _mqttPassword = optionAppSettings.Value.Secrets.MqttPassword;
            _mqttBroker = mqttBroker;
            _commonLocalizer = commonLocalizer;
            _systemEmail = common.SystemEmail;
            _sendGridApiKey = secrets.SendGridApiKey;
            _staticPath = common.StaticPath;
            _webSiteUrl = common.WebsiteUrl;
            _adminEmail = common.AdminEmail;
            _smsUsername = secrets.SmsUsername;
            _smsPassword = secrets.SmsPassword;
            _smsClientUrl = common.SmsClientUrl;
            _dbc = secrets.DBConnectionString;

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
                                options.Certificates = new List<X509Certificate>() { certificate, ca };

                            }))
                            .WithCredentials(secrets.MqttUsername, secrets.MqttPassword)
                            .WithCleanSession()
                            .Build();
            mqttBroker.ConnectAsync(mqttClientOptions, CancellationToken.None);
        }

        public Task OnClientConnected(ClientConnectedEventArgs eventArgs)
        {
            Console.WriteLine($"Client '{eventArgs.ClientId}' connected.");
            return Task.CompletedTask;
        }


        public Task ValidateConnection(ValidatingConnectionEventArgs eventArgs)
        {
            Console.WriteLine($"Client '{eventArgs.ClientId}' try to connect.");

            if (eventArgs.UserName == _mqttUsername && eventArgs.Password == _mqttPassword)
            {
                return Task.CompletedTask;
            }

            OauthClient client = OauthClientDataservice.GetOneByClientId(_iotDbContext, eventArgs.UserName);
            if (client == null)
            {
                eventArgs.ReasonCode = MqttConnectReasonCode.BadUserNameOrPassword;
                System.Console.WriteLine($"MQTT Connect Error:{Newtonsoft.Json.JsonConvert.SerializeObject("BadUserNameOrPassword Client Not Found", Newtonsoft.Json.Formatting.Indented)}");
                return Task.CompletedTask;
            }

            string hashClientSecrets = CryptographicHelper.GenerateSaltedHash(eventArgs.Password, client.Salt);
            User user = UserDataservice.GetOne(_dbContext, client.OwnerId, true);
            if (client.HashClientSecrets != hashClientSecrets)
            {
                eventArgs.ReasonCode = MqttConnectReasonCode.BadUserNameOrPassword;
                System.Console.WriteLine($"MQTT Connect Error:{Newtonsoft.Json.JsonConvert.SerializeObject("BadUserNameOrPassword Password Error", Newtonsoft.Json.Formatting.Indented)}");
                return Task.CompletedTask;
            }

            eventArgs.SessionItems.Add("userId", client.OwnerId);
            eventArgs.SessionItems.Add("deviceId", client.DeviceId.GetValueOrDefault());
            return Task.CompletedTask;
        }

        public async Task OnPublishing(InterceptingPublishEventArgs args)
        {
            bool isSensor = args.ApplicationMessage.Topic.EndsWith("/sensor");
            bool isDeviceState = args.ApplicationMessage.Topic.EndsWith("online");
            // 收到 client 來的 mqtt message topic {pin}/sensor
            if (args.ClientId != "api-server" && (isSensor || isDeviceState))
            {
                long deviceId = -1;
                long ownerId = -1;
                var clients = await _mqttHostedServer.GetClientsAsync();
                var client = clients.Where(x => x.Id == args.ClientId).FirstOrDefault();
                if (client == null)
                {
                    return;
                }
                long.TryParse(client.Session.Items["userId"].ToString(), out ownerId);
                long.TryParse(client.Session.Items["deviceId"].ToString(), out deviceId);

                if (deviceId == -1 || ownerId == -1)
                {
                    return;
                }

                List<string> raw = args.ApplicationMessage.Topic.Split("/").ToList<string>();
                if (isSensor)
                {
                    string pin = raw[0];
                    var payload = System.Text.Encoding.Default.GetString(args.ApplicationMessage.Payload);
                    var dto = Newtonsoft.Json.JsonConvert.DeserializeObject<DTOs.CreateSensorLog>(payload);
                    await DeviceSensorHelper.Create(_dbContext, _iotDbContext, ownerId, deviceId, pin, dto, _commonLocalizer, _staticPath, _webSiteUrl, _systemEmail, _adminEmail, _smsUsername, _smsPassword, _smsClientUrl, _sendGridApiKey, _mqttBroker);
                }
                else if (isDeviceState)
                {
                    DeviceStateHelper.Create(_iotDbContext, _dbc, ownerId, deviceId);
                }

            }
        }

        public Task OnClientSubscribed(ClientSubscribedTopicEventArgs args)
        {
            // prevent client subscribe topic that end withs /sensor and /status
            if (args.TopicFilter.Topic.EndsWith("/sensor") || args.TopicFilter.Topic.EndsWith("status"))
            {
                return Task.FromException(new Exception("no permission"));
            }

            List<string> raw = args.TopicFilter.Topic.Split("/").ToList<string>();
            string deviceIdStringType = raw[0];
            long deviceId = 0;
            string pin = raw[1];
            string userIdStringType = args.SessionItems["userId"].ToString();
            long userId = 0;
            long.TryParse(userIdStringType, out userId);
            long.TryParse(deviceIdStringType, out deviceId);
            if (userId == 0)
            {
                return Task.FromException(new Exception("no permission"));
            }
            Device device = DeviceDataservice.GetOne(_iotDbContext, userId, deviceId);
            if (device == null)
            {
                return Task.FromException(new Exception("no permission"));
            }
            return Task.CompletedTask;
        }
    }
}