using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;
using Microsoft.Extensions.Options;
using System.Collections.Generic;

namespace Homo.IotApi
{
    [Route("v1/test")]
    public class TestConnectController : ControllerBase
    {
        private readonly List<MqttPublisher> _localMqttPublishers;
        private readonly string _mqttUsername;
        private readonly string _mqttPassword;
        public TestConnectController(Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, IOptions<AppSettings> appSettings, List<MqttPublisher> localMqttPublishers)
        {
            _localMqttPublishers = localMqttPublishers;
            _mqttUsername = appSettings.Value.Secrets.MqttUsername;
            _mqttPassword = appSettings.Value.Secrets.MqttPassword;
        }

        [HttpGet]
        [Route("connect")]
        public dynamic connect()
        {
            MqttPublisherHelper.Connect(_localMqttPublishers, _mqttUsername, _mqttPassword);
            return new { project = "Homo.Itemhub.Api" };
        }

        [HttpGet]
        [Route("disconnect")]
        public dynamic disconnect()
        {
            MqttPublisherHelper.Disconnect(_localMqttPublishers);
            return new { project = "Homo.Itemhub.Api" };
        }
    }
}