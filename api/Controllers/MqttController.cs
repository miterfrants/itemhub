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
        private readonly string _jwtKey;
        private readonly MQTTnet.AspNetCore.MqttHostedServer _mqttHostedServer;
        private readonly string _mqttUsername;
        private readonly string _mqttPassword;
        private readonly string _systemEmail;
        private readonly string _sendGridApiKey;
        private readonly string _staticPath;
        private readonly string _webSiteUrl;
        private readonly string _adminEmail;
        private readonly string _smsUsername;
        private readonly string _smsPassword;
        private readonly string _smsClientUrl;

        public MqttController(IotDbContext iotDbContext, DBContext dbContext, IOptions<AppSettings> optionAppSettings, MQTTnet.AspNetCore.MqttHostedServer mqttHostedServer, Homo.Api.CommonLocalizer commonLocalizer)
        {
            _iotDbContext = iotDbContext;
            _dbContext = dbContext;
            AppSettings settings = optionAppSettings.Value;
            _jwtKey = optionAppSettings.Value.Secrets.JwtKey;

            var secrets = optionAppSettings.Value.Secrets;
            var common = optionAppSettings.Value.Common;

            _mqttHostedServer = mqttHostedServer;
            _mqttUsername = optionAppSettings.Value.Secrets.MqttUsername;
            _mqttPassword = optionAppSettings.Value.Secrets.MqttPassword;
            _commonLocalizer = commonLocalizer;
            _systemEmail = common.SystemEmail;
            _sendGridApiKey = secrets.SendGridApiKey;
            _staticPath = common.StaticPath;
            _webSiteUrl = common.WebsiteUrl;
            _adminEmail = common.AdminEmail;
            _smsUsername = secrets.SmsUsername;
            _smsPassword = secrets.SmsPassword;
            _smsClientUrl = common.SmsClientUrl;
        }

        public Task OnClientConnected(ClientConnectedEventArgs eventArgs)
        {
            Console.WriteLine($"Client '{eventArgs.ClientId}' connected.");
            return Task.CompletedTask;
        }


        public Task ValidateConnection(ValidatingConnectionEventArgs eventArgs)
        {
            if (eventArgs.Username == _mqttUsername && eventArgs.Password == _mqttPassword)
            {
                return Task.CompletedTask;
            }

            OauthClient client = OauthClientDataservice.GetOneByClientId(_iotDbContext, eventArgs.Username);
            if (client == null)
            {
                eventArgs.ReasonCode = MqttConnectReasonCode.BadUserNameOrPassword;
                return Task.CompletedTask;
            }

            string hashClientSecrets = CryptographicHelper.GenerateSaltedHash(eventArgs.Password, client.Salt);
            User user = UserDataservice.GetOne(_dbContext, client.OwnerId, true);
            if (client.HashClientSecrets != hashClientSecrets)
            {
                eventArgs.ReasonCode = MqttConnectReasonCode.BadUserNameOrPassword;
                return Task.CompletedTask;
            }
            return Task.CompletedTask;
        }

        public async Task OnConsumingMessageReceivced(ApplicationMessageNotConsumedEventArgs args)
        {

            // HTTP 收到改變 switch 狀態的指令 broker 送 message 到 device 去 topic /{deviceId}/{pin}/switch
            if (args.SenderId == "api-server" && args.ApplicationMessage.Topic.EndsWith("/switch"))
            {
                var payload = System.Text.Encoding.Default.GetString(args.ApplicationMessage.Payload);
                DTOs.DevicePinSwitchValue dto = Newtonsoft.Json.JsonConvert.DeserializeObject<DTOs.DevicePinSwitchValue>(payload);
                List<string> raw = args.ApplicationMessage.Topic.Split("/").ToList<string>();
                string deviceId = raw[0];
                string pin = raw[1];
                var message = new MqttApplicationMessageBuilder().WithTopic("/switch").WithPayload(
                    Newtonsoft.Json.JsonConvert.SerializeObject(new { Value = dto.Value, Pin = pin })
                ).Build();
                await _mqttHostedServer.InjectApplicationMessage(
                    new InjectedMqttApplicationMessage(message)
                    {
                        SenderClientId = deviceId
                    });
                return;
            }

            // 收到 client 來的 mqtt message topic /{userId}/{deviceId}/{pin}/sensor
            if (args.SenderId != "api-server" && args.ApplicationMessage.Topic.EndsWith("/sensor"))
            {

                List<string> raw = args.ApplicationMessage.Topic.Split("/").ToList<string>();
                long deviceId = -1;
                long ownerId = -1;
                long.TryParse(raw[0], out ownerId);
                long.TryParse(raw[1], out deviceId);
                string pin = raw[2];
                if (deviceId == -1 || ownerId == -1)
                {
                    return;
                }
                var payload = System.Text.Encoding.Default.GetString(args.ApplicationMessage.Payload);
                var dto = Newtonsoft.Json.JsonConvert.DeserializeObject<DTOs.CreateSensorLog>(payload);
                await DeviceSensorHelper.Create(_dbContext, _iotDbContext, ownerId, deviceId, pin, dto, _commonLocalizer, _staticPath, _webSiteUrl, _systemEmail, _adminEmail, _smsUsername, _smsPassword, _smsClientUrl, _sendGridApiKey, _mqttUsername, _mqttPassword);
            }
        }

        public Task OnClientSubscribed(ClientSubscribedTopicEventArgs args)
        {
            return Task.CompletedTask;
        }


    }
}