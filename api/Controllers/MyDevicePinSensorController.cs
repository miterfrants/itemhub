using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Homo.Core.Constants;
using Homo.AuthApi;
using api.Helpers;
using api.Constants;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/devices/{id}/sensors")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyDevicePinSensorController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly CommonLocalizer _commonLocalizer;
        private readonly string _systemEmail;
        private readonly string _sendGridApiKey;
        private readonly string _staticPath;
        private readonly string _webSiteUrl;
        private readonly string _adminEmail;
        public MyDevicePinSensorController(IotDbContext dbContext, Homo.Api.CommonLocalizer commonLocalizer, IOptions<AppSettings> optionAppSettings)
        {
            _dbContext = dbContext;
            _commonLocalizer = commonLocalizer;
            _systemEmail = optionAppSettings.Value.Common.SystemEmail;
            _sendGridApiKey = optionAppSettings.Value.Secrets.SendGridApiKey;
            _staticPath = optionAppSettings.Value.Common.StaticPath;
            _webSiteUrl = optionAppSettings.Value.Common.WebsiteUrl;
            _adminEmail = optionAppSettings.Value.Common.AdminEmail;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 感測 - 新增特定裝置感測資料",
            Description = ""
        )]
        [HttpPost]
        [FilterRequestFactory]
        [Route("{pin}")]
        public ActionResult<dynamic> create([FromRoute] long id, [FromRoute] string pin, [FromBody] DTOs.CreateSensorLog dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            DevicePin devicePin = DevicePinDataservice.GetOneByDeviceIdAndPin(_dbContext, extraPayload.Id, id, null, pin);
            if (devicePin == null)
            {
                throw new CustomException(ERROR_CODE.DEVICE_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }

            SensorLogDataservice.Create(_dbContext, extraPayload.Id, id, pin, dto);
            List<Trigger> triggers = TriggerDataservice.GetAll(_dbContext, extraPayload.Id, id, pin);
            List<Trigger> beTriggeredList = new List<Trigger>();
            triggers.ForEach(trigger =>
            {
                // todo: refactor the section by factory pattern
                // trigger by device current value
                if (
                    trigger.Type == TRIGGER_TYPE.CHANGE_DEVICE_STATE
                    && (
                        trigger.Operator == TRIGGER_OPERATOR.B && dto.Value > trigger.SourceThreshold
                        || trigger.Operator == TRIGGER_OPERATOR.BE && dto.Value >= trigger.SourceThreshold
                        || trigger.Operator == TRIGGER_OPERATOR.L && dto.Value < trigger.SourceThreshold
                        || trigger.Operator == TRIGGER_OPERATOR.LE && dto.Value <= trigger.SourceThreshold
                        || trigger.Operator == TRIGGER_OPERATOR.E && dto.Value == trigger.SourceThreshold
                    )
                )
                {
                    beTriggeredList.Add(trigger);
                    DevicePinDataservice.UpdateValueByDeviceId(_dbContext, extraPayload.Id, trigger.DestinationDeviceId.GetValueOrDefault(), trigger.DestinationPin, trigger.DestinationDeviceTargetState.GetValueOrDefault());
                }
                else if (
                    trigger.Type == TRIGGER_TYPE.NOTIFICATION
                    && trigger.Email != null
                    && (
                        trigger.Operator == TRIGGER_OPERATOR.B && dto.Value > trigger.SourceThreshold
                        || trigger.Operator == TRIGGER_OPERATOR.BE && dto.Value >= trigger.SourceThreshold
                        || trigger.Operator == TRIGGER_OPERATOR.L && dto.Value < trigger.SourceThreshold
                        || trigger.Operator == TRIGGER_OPERATOR.LE && dto.Value <= trigger.SourceThreshold
                        || trigger.Operator == TRIGGER_OPERATOR.E && dto.Value == trigger.SourceThreshold
                    )
                )
                {
                    beTriggeredList.Add(trigger);
                    MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.TRIGGER_NOTIFICATION, _staticPath);
                    var devicePin = DevicePinDataservice.GetOneByDeviceIdAndPin(_dbContext, extraPayload.Id, trigger.SourceDeviceId, null, trigger.SourcePin);
                    var deviceName = (devicePin.Device == null ? "" : devicePin.Device.Name);
                    template = MailTemplateHelper.ReplaceVariable(template, new
                    {
                        webSiteUrl = _webSiteUrl,
                        adminEmail = _adminEmail,
                        hello = _commonLocalizer.Get("hello"),
                        notificationContent = _commonLocalizer.Get("notificationContent"),
                        deviceName = deviceName,
                        pinName = devicePin.Name ?? devicePin.Pin,
                        labelOfOperator = TriggerOperatorHelper.GetSymbol(trigger.Operator.ToString()),
                        thresholdValue = trigger.SourceThreshold.ToString("N4"),
                        eventTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                        link = $"{_webSiteUrl}/dashboard/devices/{trigger.SourceDeviceId}",
                        callToActionButton = _commonLocalizer.Get("checkout"),
                        mailContentSystemAutoSendEmail = _commonLocalizer.Get("mailContentSystemAutoSendEmail")
                    });
                    MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
                    {
                        Subject = _commonLocalizer.Get(template.Subject, null, new Dictionary<string, string>{{
                            "deviceName", deviceName
                         }}),
                        Content = template.Content
                    }, _systemEmail, trigger.Email, _sendGridApiKey);
                }
            });

            TriggerLogDataservice.BatchedCreate(_dbContext, beTriggeredList);
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
        public ActionResult<dynamic> getList([FromRoute] long id, [FromRoute] string pin, [FromQuery] int page, [FromQuery] int limit, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return SensorLogDataservice.GetList(_dbContext, extraPayload.Id, new List<long>() { id }, pin, page, limit);
        }
    }
}
