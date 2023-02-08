using System;
using System.Linq;
using System.Threading.Tasks;
using Homo.Api;
using System.Collections.Generic;
using Homo.Core.Helpers;
using Homo.AuthApi;
using MQTTnet;
using MQTTnet.Server;
using MQTTnet.Protocol;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    [Route("v1/mqtt")]
    [ApiExplorerSettings(IgnoreApi = true)]
    [Validate]
    public class MqttController
    {
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _dbc;
        private readonly string _jwtKey;
        private readonly MQTTnet.AspNetCore.MqttHostedServer _mqttHostedServer;
        private readonly string _mqttUsername;
        private readonly string _mqttPassword;
        private List<MqttPublisher> _localMqttPublishers;
        private readonly string _systemEmail;
        private readonly string _sendGridApiKey;
        private readonly string _staticPath;
        private readonly string _webSiteUrl;
        private readonly string _adminEmail;
        private readonly string _smsUsername;
        private readonly string _smsPassword;
        private readonly string _smsClientUrl;
        private readonly MySqlServerVersion _mysqlVersion;

        public MqttController(IOptions<AppSettings> optionAppSettings, MQTTnet.AspNetCore.MqttHostedServer mqttHostedServer, Homo.Api.CommonLocalizer commonLocalizer, List<MqttPublisher> localMqttPublisher)
        {
            AppSettings settings = optionAppSettings.Value;
            _mysqlVersion = new MySqlServerVersion(new Version(8, 0, 25));

            _jwtKey = optionAppSettings.Value.Secrets.JwtKey;

            var secrets = optionAppSettings.Value.Secrets;
            var common = optionAppSettings.Value.Common;

            _mqttHostedServer = mqttHostedServer;
            _mqttUsername = optionAppSettings.Value.Secrets.MqttUsername;
            _mqttPassword = optionAppSettings.Value.Secrets.MqttPassword;
            _localMqttPublishers = localMqttPublisher;
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
        }

        public Task OnClientConnected(ClientConnectedEventArgs eventArgs)
        {
            Console.WriteLine($"Client '{eventArgs.ClientId}' connected.");
            if (eventArgs.UserName == _mqttUsername)
            {
                return Task.CompletedTask;
            }

            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            iotBuilder.UseMySql(_dbc, _mysqlVersion);
            var iotDbContext = new IotDbContext(iotBuilder.Options);

            SystemConfig localMqttPublisherEndpoints = SystemConfigDataservice.GetOne(iotDbContext, SYSTEM_CONFIG.LOCAL_MQTT_PUBLISHER_ENDPOINTS);
            MqttPublisherHelper.Connect(localMqttPublisherEndpoints.Value, _localMqttPublishers, _mqttUsername, _mqttPassword);
            OauthClient client = OauthClientDataservice.GetOneByClientId(iotDbContext, eventArgs.UserName);
            List<DTOs.DevicePin> devicePins = DevicePinDataservice.GetAll(iotDbContext, client.OwnerId, new List<long> { client.DeviceId.GetValueOrDefault() }, PIN_TYPE.SWITCH, null);

            _localMqttPublishers.ForEach(publisher =>
            {

                try
                {
                    devicePins.ForEach(devicePin =>
                    {
                        Task.Run(async delegate
                        {
                            await Task.Delay(1000);
                            return publisher.Client.PublishAsync(new MqttApplicationMessageBuilder()
                                .WithTopic($"{client.DeviceId.GetValueOrDefault()}/{devicePin.Pin}/switch")
                                .WithPayload(
                                    Newtonsoft.Json.JsonConvert.SerializeObject(
                                        new DTOs.DevicePinSwitchValue { Value = System.Math.Truncate(100 * devicePin.Value.GetValueOrDefault()) / 100 }
                                    )
                                )
                                .Build());
                        });
                    });
                }
                catch (System.Exception)
                {
                    iotDbContext.Dispose();
                    System.Console.WriteLine($"Client not connected: {publisher.IP}, {publisher.Id}");
                }

            });

            iotDbContext.Dispose();
            return Task.CompletedTask;
        }

        public Task OnClientDisconnected(ClientDisconnectedEventArgs args)
        {
            return Task.CompletedTask;
        }

        public Task ValidateConnection(ValidatingConnectionEventArgs eventArgs)
        {
            Console.WriteLine($"Client '{eventArgs.ClientId}' try to connect.");
            if (eventArgs.UserName == _mqttUsername && eventArgs.Password == _mqttPassword)
            {
                return Task.CompletedTask;
            }

            DbContextOptionsBuilder<DBContext> dbContextBuilder = new DbContextOptionsBuilder<DBContext>();
            dbContextBuilder.UseMySql(_dbc, _mysqlVersion);
            var dbContext = new DBContext(dbContextBuilder.Options);

            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            iotBuilder.UseMySql(_dbc, _mysqlVersion);
            var iotDbContext = new IotDbContext(iotBuilder.Options);

            OauthClient client = OauthClientDataservice.GetOneByClientId(iotDbContext, eventArgs.UserName);
            if (client == null)
            {
                eventArgs.ReasonCode = MqttConnectReasonCode.BadUserNameOrPassword;
                System.Console.WriteLine($"MQTT Connect Error:{Newtonsoft.Json.JsonConvert.SerializeObject("BadUserNameOrPassword Client Not Found", Newtonsoft.Json.Formatting.Indented)}");
                iotDbContext.Dispose();
                dbContext.Dispose();
                return Task.CompletedTask;
            }
            string hashClientSecrets = CryptographicHelper.GenerateSaltedHash(eventArgs.Password, client.Salt);
            User user = UserDataservice.GetOne(dbContext, client.OwnerId, true);

            if (client.HashClientSecrets != hashClientSecrets)
            {
                eventArgs.ReasonCode = MqttConnectReasonCode.BadUserNameOrPassword;
                System.Console.WriteLine($"MQTT Connect Error:{Newtonsoft.Json.JsonConvert.SerializeObject("BadUserNameOrPassword Password Error", Newtonsoft.Json.Formatting.Indented)}");
                iotDbContext.Dispose();
                dbContext.Dispose();
                return Task.CompletedTask;
            }

            List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(dbContext, client.OwnerId);
            string[] roles = permissions.SelectMany(x => Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(x.Roles)).ToArray();
            bool isVIP = roles.Any(x => x == "VIP");

            eventArgs.SessionItems.Add("userId", client.OwnerId);
            eventArgs.SessionItems.Add("deviceId", client.DeviceId.GetValueOrDefault());
            eventArgs.SessionItems.Add("isVIP", isVIP);
            iotDbContext.Dispose();
            dbContext.Dispose();
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
                bool isVIP = false;

                var clients = await _mqttHostedServer.GetClientsAsync();
                var client = clients.Where(x => x.Id == args.ClientId).FirstOrDefault();
                if (client == null)
                {
                    return;
                }
                long.TryParse(client.Session.Items["userId"].ToString(), out ownerId);
                long.TryParse(client.Session.Items["deviceId"].ToString(), out deviceId);
                bool.TryParse(client.Session.Items["isVIP"].ToString(), out isVIP);

                if (deviceId == -1 || ownerId == -1)
                {
                    return;
                }

                List<string> raw = args.ApplicationMessage.Topic.Split("/").ToList<string>();

                DbContextOptionsBuilder<DBContext> dbContextBuilder = new DbContextOptionsBuilder<DBContext>();
                dbContextBuilder.UseMySql(_dbc, _mysqlVersion);
                var dbContext = new DBContext(dbContextBuilder.Options);

                DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
                iotBuilder.UseMySql(_dbc, _mysqlVersion);
                var iotDbContext = new IotDbContext(iotBuilder.Options);

                if (isSensor)
                {
                    string pin = raw[0];
                    var payload = System.Text.Encoding.Default.GetString(args.ApplicationMessage.Payload);
                    var dto = Newtonsoft.Json.JsonConvert.DeserializeObject<DTOs.CreateSensorLog>(payload);
                    await DeviceSensorHelper.Create(dbContext, iotDbContext, ownerId, deviceId, pin, dto, _commonLocalizer, _staticPath, _webSiteUrl, _systemEmail, _adminEmail, _smsUsername, _smsPassword, _smsClientUrl, _sendGridApiKey, _localMqttPublishers, isVIP);
                }
                else if (isDeviceState)
                {
                    DeviceStateHelper.Create(iotDbContext, _dbc, ownerId, deviceId);
                }
                iotDbContext.Dispose();
                dbContext.Dispose();

            }
        }

        public Task OnClientSubscribed(ClientSubscribedTopicEventArgs args)
        {
            // prevent client subscribe topic that end withs /sensor and /status
            if (args.TopicFilter.Topic.EndsWith("/sensor") || args.TopicFilter.Topic.EndsWith("status"))
            {
                System.Console.WriteLine($"No Permission For Subscribe Sensor Or Status");
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
                System.Console.WriteLine($"No Permission For Subscribe Other Device");
                return Task.FromException(new Exception("no permission"));
            }


            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            iotBuilder.UseMySql(_dbc, _mysqlVersion);
            var iotDbContext = new IotDbContext(iotBuilder.Options);
            Device device = DeviceDataservice.GetOne(iotDbContext, userId, deviceId);
            iotDbContext.Dispose();
            if (device == null)
            {
                System.Console.WriteLine($"No Permission For Subscribe Other Device");
                return Task.FromException(new Exception("no permission"));
            }
            return Task.CompletedTask;
        }
    }
}