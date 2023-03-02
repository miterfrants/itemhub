using System;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using System.Collections.Generic;
using Homo.Core.Constants;
using Cronos;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class SchedulePipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public SchedulePipeline(string rawData,
            long pipelineId,
            long ownerId,
            List<MqttPublisher> localMqttPublishers,
            string mqttUsername,
            string mqttPassword,
            string smsUsername,
            string smsPassword,
            string smsUrl,
            string sendGridApiKey,
            string mailTemplatePath,
            string systemEmail,
            string DBConnectionString)
        {
            ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(async previous =>
                            {
                                System.Console.WriteLine($"schedule:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }
                                var next = ValidateAndGetPayload(rawData);
                                var delay = next.Value - DateTimeOffset.Now;
                                if (delay.TotalMilliseconds <= 0)
                                {

                                    // 這邊可能會有 Performance Issue 或是記憶體的這個實體消失了導致 cronjob 沒有執行, 所以這邊可能要測一下
                                    scheduleNextJob(rawData, pipelineId, ownerId, localMqttPublishers, mqttUsername, mqttPassword, smsUsername, smsPassword, smsUrl, sendGridApiKey, mailTemplatePath, systemEmail, DBConnectionString);
                                    return true;
                                }
                                else
                                {
                                    await Task.Delay((int)delay.TotalMilliseconds);
                                    scheduleNextJob(rawData, pipelineId, ownerId, localMqttPublishers, mqttUsername, mqttPassword, smsUsername, smsPassword, smsUrl, sendGridApiKey, mailTemplatePath, systemEmail, DBConnectionString);
                                    return true;
                                }
                            });
        }

        public void scheduleNextJob(
            string rawData,
            long pipelineId,
            long ownerId,
            List<MqttPublisher> localMqttPublishers,
            string mqttUsername,
            string mqttPassword,
            string smsUsername,
            string smsPassword,
            string smsUrl,
            string sendGridApiKey,
            string mailTemplatePath,
            string systemEmail,
            string DBConnectionString)
        {
            DbContextOptionsBuilder<IotDbContext> dbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
            var mysqlVersion = new MySqlServerVersion(new Version(8, 0, 25));
            dbContextBuilder.UseMySql(DBConnectionString, mysqlVersion);
            var dbContext = new IotDbContext(dbContextBuilder.Options);
            var pipelineItems = PipelineItemDataservice.GetAll(dbContext, ownerId, pipelineId, null);
            var pipelineConnectors = PipelineConnectorDataservice.GetAll(dbContext, ownerId, pipelineId, null);
            PipelineHelper.Execute(pipelineId, pipelineItems, pipelineConnectors, dbContext, ownerId, localMqttPublishers, mqttUsername, mqttPassword, smsUsername, smsPassword, smsUrl, sendGridApiKey, mailTemplatePath, systemEmail, DBConnectionString);
        }

        public static System.DateTimeOffset? ValidateAndGetPayload(string cronExpression)
        {
            if (System.String.IsNullOrEmpty(cronExpression))
            {
                throw new CustomException(ERROR_CODE.SCHEDULE_PIPELINE_INVALID_PAYLOAD_VALUE_IS_REQUIRED);
            }

            var next = CronExpression.Parse(cronExpression).GetNextOccurrence(System.DateTimeOffset.Now, System.TimeZoneInfo.Local);
            if (next == null || !next.HasValue)
            {
                // todo: change exception 
                throw new CustomException(ERROR_CODE.SCHEDULE_PIPELINE_INVALID_PAYLOAD_VALUE_IS_REQUIRED);
            }

            return next;
        }
    }

}