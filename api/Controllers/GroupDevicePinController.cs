using System;
using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;
using Swashbuckle.AspNetCore.Annotations;
using Newtonsoft.Json;
using System.Collections.Generic;
using Microsoft.Extensions.Options;

namespace Homo.IotApi
{
    [Route("v1/groups/{groupId}/devices")]
    [IotDashboardAuthorizeFactory()]
    [GroupAuthorizeFactory()]
    public class GroupDevicePinController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly List<MqttPublisher> _localMqttPublishers;
        private readonly string _mqttUsername;
        private readonly string _mqttPassword;
        private readonly string _smsUsername;
        private readonly string _smsPassword;
        private readonly string _smsClientUrl;
        private readonly string _sendGridApiKey;
        private readonly string _systemEmail;
        private readonly string _staticPath;
        private readonly string _serverId;
        private readonly string _dbConnectionString;
        public GroupDevicePinController(IotDbContext dbContext, List<MqttPublisher> localMqttPublishers, IOptions<AppSettings> appSettings)
        {
            var secrets = appSettings.Value.Secrets;
            var common = appSettings.Value.Common;
            _dbContext = dbContext;
            _localMqttPublishers = localMqttPublishers;
            _mqttUsername = secrets.MqttUsername;
            _mqttPassword = secrets.MqttPassword;
            _smsUsername = secrets.SmsUsername;
            _smsPassword = secrets.SmsPassword;
            _dbConnectionString = secrets.DBConnectionString;
            _smsClientUrl = common.SmsClientUrl;
            _sendGridApiKey = secrets.SendGridApiKey;
            _systemEmail = common.SystemEmail;
            _staticPath = common.StaticPath;
            _serverId = common.ServerId;
        }

        [SwaggerOperation(
            Tags = new[] { "群組管理" },
            Summary = "群組 - 取得裝置所有腳位",
            Description = ""
        )]
        [Route("{deviceId}/pins")]
        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long groupId, [FromRoute] long deviceId, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            var groupDevice = GroupDeviceDataservice.GetOne(_dbContext, groupId, deviceId);
            return DevicePinDataservice.GetAll(_dbContext, groupDevice.UserId, new List<long>() { deviceId }, null, null);
        }

        [SwaggerOperation(
            Tags = new[] { "群組管理" },
            Summary = "群組 - 取得裝置單一腳位",
            Description = ""
        )]
        [Route("{deviceId}/pins/{pin}")]
        [HttpGet]
        public ActionResult<dynamic> getOne([FromRoute] long groupId, [FromRoute] long deviceId, [FromRoute] string pin, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            var groupDevice = GroupDeviceDataservice.GetOne(_dbContext, groupId, deviceId);
            return DevicePinDataservice.GetOne(_dbContext, groupDevice.UserId, deviceId, null, pin);
        }

        [SwaggerOperation(
            Tags = new[] { "群組管理" },
            Summary = "群組 - 切換開關",
            Description = ""
        )]
        [Route("{deviceId}/switches/{pin}")]
        [HttpPatch]
        public ActionResult<dynamic> switchPin([FromRoute] long groupId, [FromRoute] long deviceId, [FromRoute] string pin, [FromBody] DTOs.DevicePinSwitchValue dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload, bool isVIP)
        {
            SystemConfig localMqttPublisherEndpoints = SystemConfigDataservice.GetOne(_dbContext, SYSTEM_CONFIG.LOCAL_MQTT_PUBLISHER_ENDPOINTS);
            MqttPublisherHelper.Connect(localMqttPublisherEndpoints.Value, _localMqttPublishers, _mqttUsername, _mqttPassword);
            var groupDevice = GroupDeviceDataservice.GetOne(_dbContext, groupId, deviceId);
            var ownerId = groupDevice.UserId;
            DeviceSwitchHelper.Update(_dbContext, groupDevice.UserId, deviceId, pin, dto, _localMqttPublishers);

            // run pipeline head is switch
            var pipelines = PipelineDataservice.GetAll(_dbContext, ownerId, PIPELINE_ITEM_TYPE.CHECK_SWITCH, deviceId, pin, true);
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
                if (pipelinePayload.DeviceId != deviceId || pipelinePayload.Pin != pin)
                {
                    // todo: 代表資料不一至要提醒工程師
                    return;
                }
                PipelineHelper.Execute(_serverId, pipeline.Id, pipelineItems, pipelineConnectors, ownerId, isVIP, _localMqttPublishers, _mqttUsername, _mqttPassword, _smsUsername, _smsPassword, _smsClientUrl, _sendGridApiKey, _staticPath, _systemEmail, _dbConnectionString);
            });

            return new
            {
                status = CUSTOM_RESPONSE.OK
            };
        }

        [SwaggerOperation(
                    Tags = new[] { "群組管理" },
                    Summary = "群組 - 取得感測資料分頁列表",
                    Description = ""
                )]
        [Route("{deviceId}/sensors/{pin}")]
        [HttpGet]
        public ActionResult<dynamic> getSensorData([FromRoute] long groupId, [FromRoute] long deviceId, [FromRoute] string pin, [FromQuery] int page, [FromQuery] DateTime? startAt, [FromQuery] DateTime? endAt, [FromQuery] int limit, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            var groupDevice = GroupDeviceDataservice.GetOne(_dbContext, groupId, deviceId);
            return SensorLogDataservice.GetList(_dbContext, groupDevice.UserId, new List<long>() { deviceId }, pin, page, limit, startAt, endAt);
        }

    }
}
