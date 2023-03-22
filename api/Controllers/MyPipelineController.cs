using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using Homo.Core.Constants;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/pipelines")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyPipelineController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _adminEmail;
        private readonly List<MqttPublisher> _localMqttPublishers;
        private readonly string _mqttUsername;
        private readonly string _mqttPassword;
        private readonly string _smsUsername;
        private readonly string _smsPassword;
        private readonly string _smsClientUrl;
        private readonly string _sendGridApiKey;
        private readonly string _systemEmail;
        private readonly string _staticPath;
        private readonly string _dbc;
        public MyPipelineController(IotDbContext dbContext, Homo.Api.CommonLocalizer commonLocalizer, IOptions<AppSettings> appSettings, List<MqttPublisher> localMqttPublishers)
        {
            _dbContext = dbContext;
            _commonLocalizer = commonLocalizer;

            _localMqttPublishers = localMqttPublishers;
            var secrets = appSettings.Value.Secrets;
            var common = appSettings.Value.Common;
            _mqttUsername = secrets.MqttUsername;
            _mqttPassword = secrets.MqttPassword;
            _adminEmail = common.AdminEmail;
            _smsUsername = secrets.SmsUsername;
            _smsPassword = secrets.SmsPassword;
            _smsClientUrl = common.SmsClientUrl;
            _sendGridApiKey = secrets.SendGridApiKey;
            _systemEmail = common.SystemEmail;
            _staticPath = common.StaticPath;
            _dbc = secrets.DBConnectionString;
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 取得分頁列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromQuery] int limit, [FromQuery] int page, [FromQuery] string title, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<Pipeline> records = PipelineDataservice.GetList(_dbContext, ownerId, page, limit, title);
            return new
            {
                pipelines = records,
                rowNum = PipelineDataservice.GetRowNum(_dbContext, ownerId, title)
            };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 建立新資料",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromBody] DTOs.Pipeline dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload, bool isVIP)
        {
            long ownerId = extraPayload.Id;
            long count = PipelineDataservice.GetRowNum(_dbContext, ownerId, null);
            if (!isVIP && count >= 1)
            {
                throw new CustomException(ERROR_CODE.OVER_PRICING_PLAN, System.Net.HttpStatusCode.Forbidden, new Dictionary<string, string>(){{
                    "reason", _commonLocalizer.Get("moreThanMaxNumberOfPipelineInAnyPlan", null, new Dictionary<string, string>(){{ "adminEmail", _adminEmail }})
                }});
            }
            Pipeline rewRecord = PipelineDataservice.Create(_dbContext, ownerId, dto);
            return rewRecord;
        }


        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 批次刪除",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineDataservice.BatchDelete(_dbContext, ownerId, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 取得單一Pipeline",
            Description = ""
        )]
        [HttpGet]
        [Route("{id}")]
        public ActionResult<dynamic> getOne([FromRoute] int id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            Pipeline record = PipelineDataservice.GetOne(_dbContext, ownerId, id);
            if (record == null)
            {
                throw new CustomException(Homo.AuthApi.ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }
            return record;
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 更新單一資料",
            Description = ""
        )]
        [HttpPatch]
        [Route("{id}")]
        public ActionResult<dynamic> update([FromRoute] int id, [FromBody] DTOs.Pipeline dto, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineDataservice.Update(_dbContext, ownerId, ownerId, id, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 刪除單一資料",
            Description = ""
        )]
        [HttpDelete]
        [Route("{id}")]
        public ActionResult<dynamic> delete([FromRoute] long id, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineDataservice.Delete(_dbContext, ownerId, ownerId, id);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 啟用或關閉",
            Description = ""
        )]

        [HttpPost]
        [Route("{id}/toggle")]
        public ActionResult<dynamic> toggle([FromRoute] long id, dynamic extraPayload, [FromBody] DTOs.PipelineIsRun dto, bool isVIP)
        {
            long ownerId = extraPayload.Id;
            var pipeline = PipelineDataservice.GetOne(_dbContext, ownerId, id);
            if (!dto.IsRun)
            {
                PipelineDataservice.Toggle(_dbContext, ownerId, ownerId, id, false, pipeline.FirstPieplineItemType, pipeline.FirstPipelineItemDeviceId, pipeline.FirstPipelineItemPin);
                return new { status = CUSTOM_RESPONSE.OK };
            }

            // validate pipeline
            if (!pipeline.IsRun)
            {
                // run pipeline head is schedule
                var pipelineItems = PipelineItemDataservice.GetAll(_dbContext, ownerId, id, null);
                var pipelineConnectors = PipelineConnectorDataservice.GetAll(_dbContext, ownerId, id, null);
                var pipelineHead = PipelineHelper.GetHead(pipelineItems, pipelineConnectors);
                long? deviceId = null;
                string devicePin = null;
                if (
                    pipelineHead.ItemType == PIPELINE_ITEM_TYPE.SENSOR
                )
                {
                    var sensorPipelinePayload = SensorPipeline.ValidateAndGetPayload(pipelineHead.Value);
                    deviceId = sensorPipelinePayload.DeviceId;
                    devicePin = sensorPipelinePayload.Pin;
                }
                if (
                    pipelineHead.ItemType == PIPELINE_ITEM_TYPE.SWITCH
                )
                {
                    var switchPipelinePayload = CheckSwitchPipeline.ValidateAndGetPayload(pipelineHead.Value);
                    deviceId = switchPipelinePayload.DeviceId;
                    devicePin = switchPipelinePayload.Pin;
                }
                if (
                    pipelineHead.ItemType == PIPELINE_ITEM_TYPE.CHECK_SWITCH
                )
                {
                    var checkSwitchPipelinePayload = CheckSwitchPipeline.ValidateAndGetPayload(pipelineHead.Value);
                    deviceId = checkSwitchPipelinePayload.DeviceId;
                    devicePin = checkSwitchPipelinePayload.Pin;
                }
                if (
                    pipelineHead.ItemType == PIPELINE_ITEM_TYPE.OFFLINE
                )
                {
                    var offlinePipelinePayload = OfflinePipeline.ValidateAndGetPayload(pipelineHead.Value);
                    deviceId = offlinePipelinePayload.DeviceId;
                }

                if (pipelineItems.Count > 10)
                {
                    throw new CustomException(ERROR_CODE.PIPELINE_INVALID_PAYLOAD_ITEMS_BIGGER_THAN_TEN, System.Net.HttpStatusCode.BadRequest);
                }

                PipelineDataservice.Toggle(_dbContext, ownerId, ownerId, id, true, pipelineHead.ItemType, deviceId, devicePin);

                if (pipelineHead.ItemType == PIPELINE_ITEM_TYPE.SCHEDULE)
                {
                    try
                    {
                        PipelineHelper.Execute(id, pipelineItems, pipelineConnectors, _dbContext, ownerId, isVIP, _localMqttPublishers, _mqttUsername, _mqttPassword, _smsUsername, _smsPassword, _smsClientUrl, _sendGridApiKey, _staticPath, _systemEmail, _dbc, true);
                    }
                    catch (CustomException ex)
                    {
                        PipelineDataservice.Toggle(_dbContext, ownerId, ownerId, id, false, pipelineHead.ItemType, deviceId, devicePin);
                        throw ex;
                    }
                }

            }
            return new { status = CUSTOM_RESPONSE.OK };

        }
    }
}
