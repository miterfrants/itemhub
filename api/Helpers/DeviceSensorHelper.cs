using System;
using System.Linq;
using System.Collections.Generic;
using Homo.Core.Constants;
using Homo.AuthApi;
using Homo.Api;
using System.Threading.Tasks;

namespace Homo.IotApi
{

    public class DeviceSensorHelper
    {
        public static async Task Create(DBContext dbContext, IotDbContext iotDbContext, long ownerId,
            long deviceId, string pin, DTOs.CreateSensorLog dto, CommonLocalizer commonLocalizer,
            string mailTemplatePath, string websiteUrl, string systemEmail, string adminEmail, string smsUsername, string smsPassword,
            string smsClientUrl, string sendGridApiKey,
            string mqttUsername, string mqttPassword
            )
        {
            DevicePin devicePin = DevicePinDataservice.GetOneByDeviceIdAndPin(iotDbContext, ownerId, deviceId, null, pin);

            if (devicePin == null)
            {
                throw new CustomException(ERROR_CODE.DEVICE_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }

            SensorLogDataservice.Create(iotDbContext, ownerId, deviceId, pin, dto);
            List<Trigger> triggers = TriggerDataservice.GetAll(iotDbContext, ownerId, deviceId, pin);
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
                    await DeviceSwitchHelper.Update(iotDbContext, ownerId, trigger.DestinationDeviceId.GetValueOrDefault(), trigger.DestinationPin, new DTOs.DevicePinSwitchValue() { Value = trigger.DestinationDeviceTargetState.GetValueOrDefault() }, mqttUsername, mqttPassword);
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
                    Subscription subscription = SubscriptionDataservice.GetCurrnetOne(iotDbContext, ownerId); // 這邊不能把他省掉, 因為 device 久久換一次 token, 如果把 pricing plan 記載 token, 會造成使用者已經升級了但是這邊還是用舊的 rate limit
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
                    int usage = TriggerLogDataservice.GetCountOfNotificationInPeriod(iotDbContext, startOfMonth, endOfMonth, ownerId, TRIGGER_TYPE.NOTIFICATION);
                    if (usage >= rateLimit)
                    {
                        UserDataservice.SetIsOverSubscriptionPlan(dbContext, ownerId);
                        throw new CustomException(ERROR_CODE.TRIGGER_NOTIFICATION_OVER_USING, System.Net.HttpStatusCode.Forbidden);
                    }

                    // check last notification
                    TriggerLog lastTriggerLog = TriggerLogDataservice.GetLastOne(iotDbContext, trigger.Id, ownerId, TRIGGER_TYPE.NOTIFICATION);

                    if (lastTriggerLog != null && (DateTime.Now - lastTriggerLog.CreatedAt).TotalMinutes < TriggerNotificationPeriodHelper.GetMinutes(trigger.NotificationPeriod))
                    {
                        continue;
                    }
                    beTriggeredList.Add(trigger);

                    var deviceName = (devicePin.Device == null ? "" : devicePin.Device.Name);
                    if (!String.IsNullOrEmpty(trigger.Email))
                    {
                        MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.TRIGGER_NOTIFICATION, mailTemplatePath);
                        template = MailTemplateHelper.ReplaceVariable(template, new
                        {
                            webSiteUrl = websiteUrl,
                            adminEmail = adminEmail,
                            hello = commonLocalizer.Get("hello"),
                            notificationContent = commonLocalizer.Get("notificationContent"),
                            deviceName = deviceName,
                            pinName = devicePin.Name ?? devicePin.Pin,
                            labelOfOperator = TriggerOperatorHelper.GetSymbol(trigger.Operator.ToString()),
                            thresholdValue = trigger.SourceThreshold.ToString("N4"),
                            eventTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                            link = $"{websiteUrl}/dashboard/devices/{trigger.SourceDeviceId}",
                            callToActionButton = commonLocalizer.Get("checkout"),
                            mailContentSystemAutoSendEmail = commonLocalizer.Get("mailContentSystemAutoSendEmail")
                        });

                        MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
                        {
                            Subject = commonLocalizer.Get(template.Subject, null, new Dictionary<string, string> {
                                {
                                    "deviceName",
                                    deviceName
                                }
                            }),
                            Content = template.Content
                        }, systemEmail, trigger.Email, sendGridApiKey);
                    }
                    else if (!String.IsNullOrEmpty(trigger.Phone))
                    {
                        var subject = commonLocalizer.Get("triggerNotification", null, new Dictionary<string, string> {
                            {
                                "deviceName",
                                deviceName
                            }
                        });
                        var content = commonLocalizer.Get("notificationContent");

                        SmsHelper.Send(SmsProvider.Every8D, smsUsername, smsPassword, smsClientUrl, trigger.Phone, $"{subject} {content}");
                    }

                }
            }

        }
    }
}