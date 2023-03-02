using System.Threading.Tasks.Dataflow;
using System.Collections.Generic;
namespace Homo.IotApi
{
    public interface IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
    }
    public class PipelineFactory
    {
        public IPipeline getPipeline(
            PIPELINE_ITEM_TYPE pipelineItemType,
            IotDbContext dbContext,
            long pipelineId,
            long ownerId,
            string rawData,
            List<MqttPublisher> localMqttPublishers,
            string mqttUsername,
            string mqttPassword,
            string smsUsername,
            string smsPassword,
            string smsUrl,
            string sendGridApiKey,
            string mailTemplatePath,
            string systemEmail,
            string DBConnectionString
        )
        {
            if (pipelineItemType == PIPELINE_ITEM_TYPE.CHECK_SWITCH)
            {
                return new CheckSwitchPipeline(dbContext, ownerId, rawData);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.DELAY)
            {
                return new DelayPipeline(rawData);

            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.NETWORK)
            {
                return new NetworkPipeline(rawData);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.NOTIFICATION)
            {
                return new NotificationPipeline(rawData, smsUsername, smsPassword, smsUrl, mailTemplatePath, systemEmail, sendGridApiKey);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.SCHEDULE)
            {
                return new SchedulePipeline(rawData, pipelineId, ownerId, localMqttPublishers, mqttUsername, mqttPassword, smsUsername, smsPassword, smsUrl, sendGridApiKey, mailTemplatePath, systemEmail, DBConnectionString);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.SENSOR)
            {
                return new SensorPipeline(dbContext, ownerId, rawData);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.SWITCH)
            {
                return new SwitchPipeline(dbContext, ownerId, rawData, localMqttPublishers, mqttUsername, mqttPassword);
            }
            else
            {
                return null;
            }
        }
    }

}