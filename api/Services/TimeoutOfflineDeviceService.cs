using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Homo.AuthApi;
using Homo.Core.Constants;
using Homo.Api;
using Newtonsoft.Json;

namespace Homo.IotApi
{
    public static class TimeoutOfflineDeviceService
    {
        private static Dictionary<long, CancellationTokenSource> tokenSourceCollections = new Dictionary<long, CancellationTokenSource>();
        public static void StartAsync(long ownerId, long deviceId, string dbc, CommonLocalizer commonLocalizer,
        string mailTemplatePath, string systemEmail, string sendGridApiKey,
        string smsClientUrl, string smsUsername, string smsPassword,
        string mqttUsername, string mqttPassword, List<MqttPublisher> localMqttPublishers
        )
        {
            if (tokenSourceCollections.ContainsKey(deviceId))
            {
                var previousTokenSource = tokenSourceCollections[deviceId];
                previousTokenSource.Cancel();
            }
            var tokenSource = new CancellationTokenSource();
            CancellationToken cancellationToken = tokenSource.Token;
            var task = Task.Run(async () =>
            {
                await Task.Delay(60 * 1000);
                if (cancellationToken.IsCancellationRequested)
                {
                    return;
                }
                DbContextOptionsBuilder<IotDbContext> iotDbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
                DbContextOptionsBuilder<DBContext> builder = new DbContextOptionsBuilder<DBContext>();
                var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
                iotDbContextBuilder.UseMySql(dbc, serverVersion);
                builder.UseMySql(dbc, serverVersion);
                IotDbContext newDbContext = new IotDbContext(iotDbContextBuilder.Options);
                DBContext dbContext = new DBContext(builder.Options);
                // 15 秒內 device activity log 沒查到資料就當作下線
                int count = DeviceActivityLogDataservice.GetRowNumThis15Seconds(newDbContext, ownerId, deviceId);
                if (count > 0)
                {
                    return;
                }
                DeviceDataservice.Switch(newDbContext, ownerId, deviceId, false);
                // offline notification

                Subscription subscription = SubscriptionDataservice.GetCurrnetOne(newDbContext, ownerId);
                if (subscription == null && !RelationOfGroupAndUserDataservice.IsVIP(dbContext, ownerId))
                {
                    return;
                }
                Device device = DeviceDataservice.GetOne(newDbContext, ownerId, deviceId);
                if (!device.IsOfflineNotification)
                {
                    return;
                }
                List<string> notificationTargets = device.OfflineNotificationTarget.Split(",").ToList();
                if (notificationTargets.Count > 5)  // 不允許通知超過 5 個人
                {
                    return;
                }
                notificationTargets.ForEach(target =>
                {
                    bool isEmail = ValidationHelpers.IsEmail(target);
                    bool isPhone = ValidationHelpers.IsTaiwanMobilePhoneNumber(target);
                    if (!isEmail && !isPhone)
                    {
                        return;
                    }
                    else if (isEmail)
                    {
                        MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.OFFLINE_NOTIFICATION, mailTemplatePath);
                        MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
                        {
                            Subject = commonLocalizer.Get(template.Subject, null, new Dictionary<string, string> {
                                {
                                    "deviceName",
                                    device.Name
                                }
                            }),
                            Content = template.Content.Replace("{{deviceName}}", device.Name).Replace("{{now}}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"))
                        }, systemEmail, target, sendGridApiKey);
                    }
                    else if (isPhone)
                    {
                        var content = commonLocalizer.Get("offlineNotificationContent", null, new Dictionary<string, string> {
                            {
                                "deviceName",
                                device.Name
                            }, {
                                "now",
                                DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                            }
                        });
                        SmsHelper.Send(SmsProvider.Every8D, smsUsername, smsPassword, smsClientUrl, target, $"{content}");
                    }
                });
            }, tokenSource.Token);

            if (tokenSourceCollections.ContainsKey(deviceId))
            {
                tokenSourceCollections[deviceId] = tokenSource;
            }
            else
            {
                tokenSourceCollections.Add(deviceId, tokenSource);
            }

            // run pipeline head is offline
            DbContextOptionsBuilder<IotDbContext> iotDbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            iotDbContextBuilder.UseMySql(dbc, serverVersion);
            IotDbContext iotDbContext = new IotDbContext(iotDbContextBuilder.Options);
            var offlinePipelines = PipelineDataservice.GetAll(iotDbContext, ownerId, PIPELINE_ITEM_TYPE.OFFLINE, deviceId, null, true);
            var pipelineInvalidError = new Dictionary<long, CustomException>();
            offlinePipelines.ForEach(pipeline =>
            {
                var pipelineItems = PipelineItemDataservice.GetAll(iotDbContext, ownerId, pipeline.Id, null);
                var pipelineConnectors = PipelineConnectorDataservice.GetAll(iotDbContext, ownerId, pipeline.Id, null);
                var pipelineHead = PipelineHelper.GetHead(pipelineItems, pipelineConnectors);
                // double check
                if (pipelineHead.ItemType != PIPELINE_ITEM_TYPE.SENSOR)
                {
                    // todo: 代表資料不一至要提醒工程師
                    return;
                }
                var pipelinePayload = JsonConvert.DeserializeObject<SensorPipelinePayload>(pipelineHead.Value);
                // double check
                if (pipelinePayload.DeviceId != deviceId)
                {
                    // todo: 代表資料不一至要提醒工程師
                    return;
                }


                try
                {
                    PipelineHelper.Execute(pipeline.Id, pipelineItems, pipelineConnectors, iotDbContext, ownerId, localMqttPublishers, mqttUsername, mqttPassword, smsUsername, smsPassword, smsClientUrl, sendGridApiKey, mailTemplatePath, systemEmail, dbc);
                }
                catch (System.Exception ex)
                {
                    if (ex.GetType() == typeof(Homo.Core.Constants.CustomException))
                    {
                        // 預期的錯誤在後面把他塞到 pipeline execute log 裏頭
                        pipelineInvalidError.Add(pipeline.Id, (Homo.Core.Constants.CustomException)ex);
                    }
                    else
                    {
                        throw ex;
                    }
                }
            });

            foreach (long pipelineId in pipelineInvalidError.Keys)
            {
                PipelineExecuteLogDataservice.Create(iotDbContext, ownerId, new DTOs.PipelineExecuteLog()
                {
                    PipelineId = pipelineId,
                    CurrentPipelineId = null,
                    IsCompleted = false,
                    Log = pipelineInvalidError[pipelineId].Message
                });
            }
        }
    }
}
