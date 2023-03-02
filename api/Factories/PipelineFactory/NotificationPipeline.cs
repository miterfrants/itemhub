using System.Threading.Tasks.Dataflow;
using Newtonsoft.Json;
using Homo.Core.Constants;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public class NotificationPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public NotificationPipeline(string rawData, string smsUsername, string smsPassword, string smsUrl, string mailTemplatePath, string systemEmail, string sendGridApiKey)
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
                                return true;
                            });
        }

        public static NotificationPipelinePayload ValidateAndGetPayload(string rawData)
        {
            var payload = JsonConvert.DeserializeObject<NotificationPipelinePayload>(rawData);
            if (payload.NotificationType == null)
            {
                throw new CustomException(ERROR_CODE.NOTIFICATION_PIPELINE_INVALID_PAYLOAD_NOTIFICATION_TYPE_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            if (payload.NotificationType == PIPELINE_NOTIFICATION_TYPE.EMAIL && System.String.IsNullOrEmpty(payload.Email))
            {
                throw new CustomException(ERROR_CODE.NOTIFICATION_PIPELINE_INVALID_PAYLOAD_EMAIL_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.NotificationType == PIPELINE_NOTIFICATION_TYPE.SMS && System.String.IsNullOrEmpty(payload.Phone))
            {
                throw new CustomException(ERROR_CODE.NOTIFICATION_PIPELINE_INVALID_PAYLOAD_PHONE_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (System.String.IsNullOrEmpty(payload.Message))
            {
                throw new CustomException(ERROR_CODE.NOTIFICATION_PIPELINE_INVALID_PAYLOAD_MESSAGE_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.Message.Length > 50)
            {
                throw new CustomException(ERROR_CODE.NOTIFICATION_PIPELINE_INVALID_PAYLOAD_MESSAGE_MAX_LENGTH_50, System.Net.HttpStatusCode.BadRequest);
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