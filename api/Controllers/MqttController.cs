using System;
using System.Threading.Tasks;
using Homo.Api;
using System.Collections.Generic;
using Homo.Core.Constants;
using Homo.Core.Helpers;
using Homo.AuthApi;
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


        public MqttController(IotDbContext iotDbContext, DBContext dbContext, IOptions<AppSettings> optionAppSettings, MQTTnet.AspNetCore.MqttHostedServer mqttHostedServer)
        {
            _iotDbContext = iotDbContext;
            _dbContext = dbContext;
            AppSettings settings = optionAppSettings.Value;
            _jwtKey = optionAppSettings.Value.Secrets.JwtKey;
            _mqttHostedServer = mqttHostedServer;
        }

        public Task OnClientConnected(ClientConnectedEventArgs eventArgs)
        {
            Console.WriteLine($"Client '{eventArgs.ClientId}' connected.");
            return Task.CompletedTask;
        }


        public Task ValidateConnection(ValidatingConnectionEventArgs eventArgs)
        {
            Console.WriteLine($"Client '{eventArgs.ClientId}' try to Connecting....");
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

    }
}