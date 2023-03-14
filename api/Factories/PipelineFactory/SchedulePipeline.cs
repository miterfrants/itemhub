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
        public SchedulePipeline(long id, long pipelineId, long ownerId, string DBConnectionString, bool isHead, bool isEnd, bool isVIP, string rawData,
            List<MqttPublisher> localMqttPublishers,
            string mqttUsername,
            string mqttPassword,
            string smsUsername,
            string smsPassword,
            string smsUrl,
            string sendGridApiKey,
            string mailTemplatePath,
            string systemEmail
            )
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
                                try
                                {
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

                                        var delay = next.Value - DateTimeOffset.Now;
                                        if (delay.TotalMilliseconds > 0)
                                        {
                                            await Task.Delay((int)delay.TotalMilliseconds);
                                        }
                                        scheduleNextJob(rawData, pipelineId, ownerId, isVIP, localMqttPublishers, mqttUsername, mqttPassword, smsUsername, smsPassword, smsUrl, sendGridApiKey, mailTemplatePath, systemEmail, DBConnectionString);

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
                                }
                                catch (System.Exception ex)
                                {
                                    System.Console.WriteLine($"testing:{Newtonsoft.Json.JsonConvert.SerializeObject(ex, Newtonsoft.Json.Formatting.Indented)}");
                                    return false;
                                }
                            });
        }

        public void scheduleNextJob(
            string rawData,
            long pipelineId,
            long ownerId,
            bool isVIP,
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
            PipelineHelper.Execute(pipelineId, pipelineItems, pipelineConnectors, dbContext, ownerId, isVIP, localMqttPublishers, mqttUsername, mqttPassword, smsUsername, smsPassword, smsUrl, sendGridApiKey, mailTemplatePath, systemEmail, DBConnectionString);
        }

        public static System.DateTimeOffset? ValidateAndGetPayload(string cronExpression)
        {
            if (System.String.IsNullOrEmpty(cronExpression))
            {
                throw new CustomException(ERROR_CODE.SCHEDULE_PIPELINE_INVALID_VALUE_REQUIRED);
            }

            var next = CronExpression.Parse(cronExpression).GetNextOccurrence(System.DateTimeOffset.Now, System.TimeZoneInfo.Local);
            if (next == null || !next.HasValue)
            {
                // todo: change exception 
                throw new CustomException(ERROR_CODE.SCHEDULE_PIPELINE_INVALID_VALUE_REQUIRED);
            }

            return next;
        }
    }

}