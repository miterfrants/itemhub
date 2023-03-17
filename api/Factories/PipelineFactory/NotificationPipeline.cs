using System;
using System.Threading.Tasks.Dataflow;
using Newtonsoft.Json;
using Homo.Core.Constants;
using Homo.AuthApi;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class NotificationPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public NotificationPipeline(long id, long pipelineId, long ownerId, string DBConnectionString, bool isHead, bool isEnd, bool isVIP, string rawData, string smsUsername, string smsPassword, string smsUrl, string mailTemplatePath, string systemEmail, string sendGridApiKey)
        {
            ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(async previous =>
                            {
                                System.Console.WriteLine($"notification:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }

                                var payload = ValidateAndGetPayload(rawData);

                                DbContextOptionsBuilder<IotDbContext> IotDbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
                                var mysqlVersion = new MySqlServerVersion(new Version(8, 0, 25));
                                IotDbContextBuilder.UseMySql(DBConnectionString, mysqlVersion);
                                using (var iotDbContext = new IotDbContext(IotDbContextBuilder.Options))
                                {
                                    if (!isVIP && isHead && RateLimitDataservice.IsPipelineExecuteLogOverPricingPlan(iotDbContext, ownerId, pipelineId))
                                    {
                                        PipelineExecuteLogDataservice.Create(iotDbContext, ownerId, new DTOs.PipelineExecuteLog()
                                        {
                                            IsHead = isHead,
                                            IsEnd = isEnd,
                                            PipelineId = pipelineId,
                                            ItemId = id,
                                            Raw = rawData,
                                            Message = "Over Subscription"
                                        });
                                        return false;
                                    }


                                    if (payload.NotificationType == PIPELINE_NOTIFICATION_TYPE.SMS)
                                    {
                                        await SmsHelper.Send(SmsProvider.Every8D, smsUsername, smsPassword, smsUrl, payload.Phone, payload.Message);
                                    }
                                    else if (payload.NotificationType == PIPELINE_NOTIFICATION_TYPE.EMAIL)
                                    {
                                        await MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
                                        {
                                            Subject = "ItemHub Pipeline Notification",
                                            Content = payload.Message
                                        }, systemEmail, payload.Email, sendGridApiKey);
                                    }

                                    PipelineExecuteLogDataservice.Create(iotDbContext, ownerId, new DTOs.PipelineExecuteLog()
                                    {
                                        IsHead = isHead,
                                        IsEnd = isEnd,
                                        PipelineId = pipelineId,
                                        ItemId = id,
                                        Raw = rawData
                                    });
                                    return true;
                                }
                            });
        }

        public static NotificationPipelinePayload ValidateAndGetPayload(string rawData)
        {
            if (System.String.IsNullOrEmpty(rawData))
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_PAYLOAD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            var payload = JsonConvert.DeserializeObject<NotificationPipelinePayload>(rawData);
            if (payload.NotificationType == null)
            {
                throw new CustomException(ERROR_CODE.NOTIFICATION_PIPELINE_INVALID_NOTIFICATION_TYPE_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            if (payload.NotificationType == PIPELINE_NOTIFICATION_TYPE.EMAIL && System.String.IsNullOrEmpty(payload.Email))
            {
                throw new CustomException(ERROR_CODE.NOTIFICATION_PIPELINE_INVALID_EMAIL_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.NotificationType == PIPELINE_NOTIFICATION_TYPE.SMS && System.String.IsNullOrEmpty(payload.Phone))
            {
                throw new CustomException(ERROR_CODE.NOTIFICATION_PIPELINE_INVALID_PHONE_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (System.String.IsNullOrEmpty(payload.Message))
            {
                throw new CustomException(ERROR_CODE.NOTIFICATION_PIPELINE_INVALID_MESSAGE_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.Message.Length > 50)
            {
                throw new CustomException(ERROR_CODE.NOTIFICATION_PIPELINE_INVALID_MESSAGE_TOO_LONG_50, System.Net.HttpStatusCode.BadRequest);
            }
            return payload;
        }
    }

    public class NotificationPipelinePayload
    {
        public PIPELINE_NOTIFICATION_TYPE? NotificationType { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Message { get; set; }

    }

}