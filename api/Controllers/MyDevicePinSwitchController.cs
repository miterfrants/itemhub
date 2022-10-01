using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

using Swashbuckle.AspNetCore.Annotations;
using MQTTnet;
using MQTTnet.Client;

using Homo.Api;
using Homo.Core.Constants;

namespace Homo.IotApi
{
    [Route("v1/my/devices/{id}/switches")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyDeviceSwitchController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly MQTTnet.Client.MqttClient _mqttBroker;
        private readonly string _mqttUsername;
        private readonly string _mqttPassword;
        public MyDeviceSwitchController(IotDbContext dbContext, IOptions<AppSettings> appSettings, MQTTnet.Client.MqttClient mqttBroker)
        {
            _dbContext = dbContext;
            _mqttBroker = mqttBroker;
            _mqttUsername = appSettings.Value.Secrets.MqttUsername;
            _mqttPassword = appSettings.Value.Secrets.MqttPassword;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 開關 - 取得所有開關 PIN",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return DevicePinDataservice.GetAll(_dbContext, extraPayload.Id, new List<long>() { id }, DEVICE_MODE.SWITCH, null);
        }


        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 開關 - 切換開關",
            Description = ""
        )]
        [HttpPatch]
        [Route("{pin}")]
        public async Task<dynamic> update([FromRoute] long id, [FromRoute] string pin, [FromBody] DTOs.DevicePinSwitchValue dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            await MqttBrokerHelper.Connect(_mqttBroker, _mqttUsername, _mqttPassword);
            await DeviceSwitchHelper.Update(_dbContext, extraPayload.Id, id, pin, dto, _mqttBroker);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
