using Newtonsoft.Json;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Annotations;
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
        private readonly string _dbConnectionString;
        private readonly string _smsUsername;
        private readonly string _smsPassword;
        private readonly string _smsClientUrl;
        private readonly string _sendGridApiKey;
        private readonly string _systemEmail;
        private readonly string _staticPath;
        private readonly string _serverId;
        public MyDeviceSwitchController(IotDbContext dbContext, IOptions<AppSettings> appSettings, List<MqttPublisher> localMqttPublishers)
        {
            _dbContext = dbContext;
            _localMqttPublishers = localMqttPublishers;

            var secrets = appSettings.Value.Secrets;
            var common = appSettings.Value.Common;
            _mqttUsername = secrets.MqttUsername;
            _mqttPassword = secrets.MqttPassword;
            _dbConnectionString = secrets.DBConnectionString;
            _smsUsername = secrets.SmsUsername;
            _smsPassword = secrets.SmsPassword;
            _smsClientUrl = common.SmsClientUrl;
            _sendGridApiKey = secrets.SendGridApiKey;
            _systemEmail = common.SystemEmail;
            _staticPath = common.StaticPath;
            _serverId = common.ServerId;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 開關 - 取得所有開關 PIN",
            Description = "僅會輸出 id, value, pin"
        )]
        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return DevicePinDataservice.GetAllSummary(_dbContext, extraPayload.Id, new List<long>() { id }, PIN_TYPE.SWITCH, null);
        }


        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 開關 - 切換開關",
            Description = ""
        )]
        [HttpPatch]
        [Route("{pin}")]
        public ActionResult<dynamic> update([FromRoute] long id, [FromRoute] string pin, [FromBody] DTOs.DevicePinSwitchValue dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload, bool isVIP)
        {
            var ownerId = extraPayload.Id;
            SystemConfig localMqttPublisherEndpoints = SystemConfigDataservice.GetOne(_dbContext, SYSTEM_CONFIG.LOCAL_MQTT_PUBLISHER_ENDPOINTS);
            MqttPublisherHelper.Connect(localMqttPublisherEndpoints.Value, _localMqttPublishers, _mqttUsername, _mqttPassword);
            DeviceSwitchHelper.Update(_dbContext, extraPayload.Id, id, pin, dto, _localMqttPublishers);
            // run pipeline head is switch
            var pipelines = PipelineDataservice.GetAll(_dbContext, ownerId, PIPELINE_ITEM_TYPE.CHECK_SWITCH, id, pin, true);
            var pipelineInvalidError = new Dictionary<long, CustomException>();
            pipelines.ForEach(pipeline =>
            {
                var pipelineItems = PipelineItemDataservice.GetAll(_dbContext, ownerId, pipeline.Id, null);
                var pipelineConnectors = PipelineConnectorDataservice.GetAll(_dbContext, ownerId, pipeline.Id, null);
                var pipelineHead = PipelineHelper.GetHead(pipelineItems, pipelineConnectors);
                // double check
                if (pipelineHead.ItemType != PIPELINE_ITEM_TYPE.CHECK_SWITCH)
                {
                    // todo: 代表資料不一至要提醒工程師
                    return;
                }
                var pipelinePayload = JsonConvert.DeserializeObject<SwitchPipelinePayload>(pipelineHead.Value);
                // double check
                if (pipelinePayload.DeviceId != id || pipelinePayload.Pin != pin)
                {
                    // todo: 代表資料不一至要提醒工程師
                    return;
                }
                PipelineHelper.Execute(_serverId, pipeline.Id, pipelineItems, pipelineConnectors, _dbContext, ownerId, isVIP, _localMqttPublishers, _mqttUsername, _mqttPassword, _smsUsername, _smsPassword, _smsClientUrl, _sendGridApiKey, _staticPath, _systemEmail, _dbConnectionString);
            });

            return new
            {
                status = CUSTOM_RESPONSE.OK
            };
        }
    }
}
