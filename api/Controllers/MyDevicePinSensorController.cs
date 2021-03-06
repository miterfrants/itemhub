using System;
using System.Collections.Generic;
using System.Linq;
using api.Constants;
using api.Helpers;
using Homo.Api;
using Homo.AuthApi;
using Homo.Core.Constants;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Annotations;

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
        public MyDevicePinSensorController(IotDbContext iotDbContext, DBContext dbContext, Homo.Api.CommonLocalizer commonLocalizer, IOptions<AppSettings> optionAppSettings)
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
            DevicePin devicePin = DevicePinDataservice.GetOneByDeviceIdAndPin(_iotDbContext, extraPayload.Id, id, null, pin);

            if (devicePin == null)
            {
                throw new CustomException(ERROR_CODE.DEVICE_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }

            SensorLogDataservice.Create(_iotDbContext, extraPayload.Id, id, pin, dto);
            List<Trigger> triggers = TriggerDataservice.GetAll(_iotDbContext, extraPayload.Id, id, pin);
            List<Trigger> beTriggeredList = new List<Trigger>();
            for (int i = 0; i < triggers.Count(); i++)
            {
                Trigger trigger = triggers[i];
                // todo: refactor the section by factory pattern
                // trigger by device current value
                if (
                    trigger.Type == TRIGGER_TYPE.CHANGE_DEVICE_STATE &&
                    (
                        trigger.Operator == TRIGGER_OPERATOR.B && dto.Value > trigger.SourceThreshold ||
                        trigger.Operator == TRIGGER_OPERATOR.BE && dto.Value >= trigger.SourceThreshold ||
                        trigger.Operator == TRIGGER_OPERATOR.L && dto.Value < trigger.SourceThreshold ||
                        trigger.Operator == TRIGGER_OPERATOR.LE && dto.Value <= trigger.SourceThreshold ||
                        trigger.Operator == TRIGGER_OPERATOR.E && dto.Value == trigger.SourceThreshold
                    )
                )
                {
                    beTriggeredList.Add(trigger);
                    DevicePinDataservice.UpdateValueByDeviceId(_iotDbContext, extraPayload.Id, trigger.DestinationDeviceId.GetValueOrDefault(), trigger.DestinationPin, trigger.DestinationDeviceTargetState.GetValueOrDefault());
                }
                else if (
                    trigger.Type == TRIGGER_TYPE.NOTIFICATION &&
                    (trigger.Email != null || trigger.Phone != null) &&
                    (
                        trigger.Operator == TRIGGER_OPERATOR.B && dto.Value > trigger.SourceThreshold ||
                        trigger.Operator == TRIGGER_OPERATOR.BE && dto.Value >= trigger.SourceThreshold ||
                        trigger.Operator == TRIGGER_OPERATOR.L && dto.Value < trigger.SourceThreshold ||
                        trigger.Operator == TRIGGER_OPERATOR.LE && dto.Value <= trigger.SourceThreshold ||
                        trigger.Operator == TRIGGER_OPERATOR.E && dto.Value == trigger.SourceThreshold
                    )
                )
                {
                    // 這邊當流量大的時候可能會變成 bottleneck, 未來可以考慮改成 async 的方式去判斷使用者是不是已經超過用量了
                    Subscription subscription = SubscriptionDataservice.GetCurrnetOne(_iotDbContext, extraPayload.Id); // 這邊不能把他省掉, 因為 device 久久換一次 token, 如果把 pricing plan 記載 token, 會造成使用者已經升級了但是這邊還是用舊的 rate limit
                    int rateLimit = 0;
                    if (trigger.Email != null)
                    {
                        rateLimit = SubscriptionHelper.GetTriggerEmailNotificastionRateLimit(subscription == null ? null : (PRICING_PLAN)subscription.PricingPlan);
                    }
                    else if (trigger.Phone != null)
                    {
                        rateLimit = SubscriptionHelper.GetTriggerSmsNotificastionRateLimit(subscription == null ? null : (PRICING_PLAN)subscription.PricingPlan);
                    }
                    DateTime startOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    int daysInMonth = System.DateTime.DaysInMonth(DateTime.Now.Year, DateTime.Now.Month);
                    DateTime endOfMonth = startOfMonth.AddDays(daysInMonth - 1).AddHours(23).AddMinutes(59).AddSeconds(59);
                    int usage = TriggerLogDataservice.GetCountOfNotificationInPeriod(_iotDbContext, startOfMonth, endOfMonth, extraPayload.Id, TRIGGER_TYPE.NOTIFICATION);
                    if (usage >= rateLimit)
                    {
                        UserDataservice.SetIsOverSubscriptionPlan(_dbContext, extraPayload.Id);
                        throw new CustomException(ERROR_CODE.TRIGGER_NOTIFICATION_OVER_USING, System.Net.HttpStatusCode.Forbidden);
                    }

                    // check last notification
                    TriggerLog lastTriggerLog = TriggerLogDataservice.GetLastOne(_iotDbContext, trigger.Id, extraPayload.Id, TRIGGER_TYPE.NOTIFICATION);

                    if (lastTriggerLog != null && (DateTime.Now - lastTriggerLog.CreatedAt).TotalMinutes < TriggerNotificationPeriodHelper.GetMinutes(trigger.NotificationPeriod))
                    {
                        continue;
                    }
                    beTriggeredList.Add(trigger);

                    var deviceName = (devicePin.Device == null ? "" : devicePin.Device.Name);
                    if (!String.IsNullOrEmpty(trigger.Email))
                    {
                        MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.TRIGGER_NOTIFICATION, _staticPath);
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
                            Subject = _commonLocalizer.Get(template.Subject, null, new Dictionary<string, string> {
                                {
                                    "deviceName",
                                    deviceName
                                }
                            }),
                            Content = template.Content
                        }, _systemEmail, trigger.Email, _sendGridApiKey);
                    }
                    else if (!String.IsNullOrEmpty(trigger.Phone))
                    {
                        var subject = _commonLocalizer.Get("triggerNotification", null, new Dictionary<string, string> {
                            {
                                "deviceName",
                                deviceName
                            }
                        });
                        var content = _commonLocalizer.Get("notificationContent");

                        SmsHelper.Send(SmsProvider.Every8D, _smsUsername, _smsPassword, _smsClientUrl, trigger.Phone, $"{subject} {content}");
                    }

                }
            }

            TriggerLogDataservice.BatchedCreate(_iotDbContext, beTriggeredList);
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
            return SensorLogDataservice.GetList(_iotDbContext, extraPayload.Id, new List<long>() { id }, pin, page, limit);
        }
    }
}