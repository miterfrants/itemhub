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
        private readonly List<MqttPublisher> _localMqttPublishers;
        private readonly string _mqttUsername;
        private readonly string _mqttPassword;
        public MyDeviceSwitchController(IotDbContext dbContext, IOptions<AppSettings> appSettings, List<MqttPublisher> localMqttPublishers)
        {
            _dbContext = dbContext;
            _localMqttPublishers = localMqttPublishers;
            _mqttUsername = appSettings.Value.Secrets.MqttUsername;
            _mqttPassword = appSettings.Value.Secrets.MqttPassword;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 開關 - 取得所有開關 PIN",
            Description = "僅會輸出 id, value, pin"
        )]
        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return DevicePinDataservice.GetAllSummary(_dbContext, extraPayload.Id, new List<long>() { id }, DEVICE_MODE.SWITCH, null);
        }


        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 開關 - 切換開關",
            Description = ""
        )]
        [HttpPatch]
        [Route("{pin}")]
        public ActionResult<dynamic> update([FromRoute] long id, [FromRoute] string pin, [FromBody] DTOs.DevicePinSwitchValue dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            SystemConfig localMqttPublisherEndpoints = SystemConfigDataservice.GetOne(_dbContext, SYSTEM_CONFIG.LOCAL_MQTT_PUBLISHER_ENDPOINTS);
            MqttPublisherHelper.Connect(localMqttPublisherEndpoints.Value, _localMqttPublishers, _mqttUsername, _mqttPassword);
            DeviceSwitchHelper.Update(_dbContext, extraPayload.Id, id, pin, dto, _localMqttPublishers);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
