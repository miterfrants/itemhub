using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Homo.Api;
using Homo.AuthApi;
using Homo.Core.Constants;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Annotations;
using System.Threading.Tasks;

namespace Homo.IotApi
{
    [Route("v1/my/devices/{id}/sensors")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyDevicePinSensorController : ControllerBase
    {
        private readonly IotDbContext _iotDbContext;
        private readonly DBContext _dbContext;
        private readonly CommonLocalizer _commonLocalizer;
        private readonly string _systemEmail;
        private readonly string _sendGridApiKey;
        private readonly string _staticPath;
        private readonly string _webSiteUrl;
        private readonly string _adminEmail;
        private readonly string _smsUsername;
        private readonly string _smsPassword;
        private readonly string _smsClientUrl;
        private readonly List<MqttPublisher> _localMqttPublishers;
        private readonly string _mqttUsername;
        private readonly string _mqttPassword;
        private readonly string _dbConnectionString;
        private readonly string _serverId;
        public MyDevicePinSensorController(IotDbContext iotDbContext, DBContext dbContext, Homo.Api.CommonLocalizer commonLocalizer, IOptions<AppSettings> optionAppSettings, List<MqttPublisher> localMqttPublishers)
        {
            var secrets = optionAppSettings.Value.Secrets;
            var common = optionAppSettings.Value.Common;
            _iotDbContext = iotDbContext;
            _dbContext = dbContext;
            _commonLocalizer = commonLocalizer;
            _systemEmail = common.SystemEmail;
            _sendGridApiKey = secrets.SendGridApiKey;
            _staticPath = common.StaticPath;
            _webSiteUrl = common.WebsiteUrl;
            _adminEmail = common.AdminEmail;
            _smsUsername = secrets.SmsUsername;
            _smsPassword = secrets.SmsPassword;
            _smsClientUrl = common.SmsClientUrl;
            _localMqttPublishers = localMqttPublishers;
            _mqttUsername = secrets.MqttUsername;
            _mqttPassword = secrets.MqttPassword;
            _dbConnectionString = secrets.DBConnectionString;
            _serverId = common.ServerId;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 感測 - 新增特定裝置感測資料",
            Description = ""
        )]
        [HttpPost]
        [FilterRequestFactory]
        [Route("{pin}")]
        public async Task<dynamic> create([FromRoute] long id, [FromRoute] string pin, [FromBody] DTOs.CreateSensorLog dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload, bool isVIP)
        {
            SystemConfig localMqttPublisherEndpoints = SystemConfigDataservice.GetOne(_iotDbContext, SYSTEM_CONFIG.LOCAL_MQTT_PUBLISHER_ENDPOINTS);
            MqttPublisherHelper.Connect(localMqttPublisherEndpoints.Value, _localMqttPublishers, _mqttUsername, _mqttPassword);
            await DeviceSensorHelper.Create(_dbContext, _iotDbContext, extraPayload.Id, id, pin, dto, _commonLocalizer, _staticPath, _webSiteUrl, _systemEmail, _adminEmail, _smsUsername, _smsPassword, _smsClientUrl, _sendGridApiKey, _localMqttPublishers, isVIP);
            long ownerId = extraPayload.Id;
            DeviceStateHelper.Create(_iotDbContext, _dbConnectionString, _serverId, ownerId, id, _commonLocalizer, _staticPath, _systemEmail, _sendGridApiKey, _smsClientUrl, _smsUsername, _smsPassword, _mqttUsername, _mqttPassword, _localMqttPublishers, _webSiteUrl, _adminEmail);

            // run pipeline head is sensor
            var pipelines = PipelineDataservice.GetAll(_iotDbContext, ownerId, PIPELINE_ITEM_TYPE.SENSOR, id, pin, true);
            pipelines.ForEach(pipeline =>
            {
                var pipelineItems = PipelineItemDataservice.GetAll(_iotDbContext, ownerId, pipeline.Id, null);
                var pipelineConnectors = PipelineConnectorDataservice.GetAll(_iotDbContext, ownerId, pipeline.Id, null);
                var pipelineHead = PipelineHelper.GetHead(pipelineItems, pipelineConnectors);
                // double check
                if (pipelineHead.ItemType != PIPELINE_ITEM_TYPE.SENSOR)
                {
                    // todo: 代表資料不一至要提醒工程師
                    return;
                }
                var pipelinePayload = JsonConvert.DeserializeObject<SensorPipelinePayload>(pipelineHead.Value);
                // double check
                if (pipelinePayload.DeviceId != id || pipelinePayload.Pin != pin)
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
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 感測 - 取得感測資料分頁列表",
            Description = ""
        )]
        [HttpGet]
        [Route("{pin}")]
        public ActionResult<dynamic> getList([FromRoute] long id, [FromRoute] string pin, [FromQuery] int page, [FromQuery] DateTime? startAt, [FromQuery] DateTime? endAt, [FromQuery] int limit, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return SensorLogDataservice.GetList(_iotDbContext, extraPayload.Id, new List<long>() { id }, pin, page, limit, startAt, endAt);
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 感測 - 統計資料",
            Description = ""
        )]
        [HttpGet]
        [Route("{pin}/aggregate")]
        public ActionResult<dynamic> getAggregateValue([FromRoute] long id, [FromRoute] string pin, [FromQuery] DateTime? startAt, [FromQuery] DateTime? endAt, [FromQuery] PIPELINE_DEVICE_STATISTICAL_METHODS statisticalMethods, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return SensorLogDataservice.GetAggregateValue(_iotDbContext, extraPayload.Id, id, pin, statisticalMethods, null, null, startAt, endAt).GetValueOrDefault(0);
        }


    }
}