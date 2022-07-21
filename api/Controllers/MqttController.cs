using System;
using System.Threading.Tasks;
using Homo.Api;
using MQTTnet.Server;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Homo.IotApi
{
    [Route("v1/mqtt")]
    [SwaggerUiInvisibility]
    [Validate]
    public class MqttController
    {
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly IotDbContext _dbContext;
        public MqttController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public Task OnClientConnected(ClientConnectedEventArgs eventArgs)
        {
            Console.WriteLine($"Client '{eventArgs.ClientId}' connected.");
            return Task.CompletedTask;
        }


        public Task ValidateConnection(ValidatingConnectionEventArgs eventArgs)
        {
            Console.WriteLine($"Client '{eventArgs.ClientId}' wants to connect. Accepting!");
            return Task.CompletedTask;
        }

    }
}