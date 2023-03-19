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
            string serverId,
            PIPELINE_ITEM_TYPE pipelineItemType,
            long id,
            long pipelineId,
            long ownerId,
            string DBConnectionString,
            bool isHead,
            bool isEnd,
            bool isVIP,
            string rawData,
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
            if (pipelineItemType == PIPELINE_ITEM_TYPE.CHECK_SWITCH)
            {
                return new CheckSwitchPipeline(id, pipelineId, ownerId, DBConnectionString, isHead, isEnd, isVIP, rawData);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.DELAY)
            {
                return new DelayPipeline(id, ownerId, pipelineId, DBConnectionString, isHead, isEnd, isVIP, rawData);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.NETWORK)
            {
                return new NetworkPipeline(id, pipelineId, ownerId, DBConnectionString, isHead, isEnd, isVIP, rawData);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.NOTIFICATION)
            {
                return new NotificationPipeline(id, pipelineId, ownerId, DBConnectionString, isHead, isEnd, isVIP, rawData, smsUsername, smsPassword, smsUrl, mailTemplatePath, systemEmail, sendGridApiKey);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.SCHEDULE)
            {
                return new SchedulePipeline(serverId, id, pipelineId, ownerId, DBConnectionString, isHead, isEnd, isVIP, rawData, localMqttPublishers, mqttUsername, mqttPassword, smsUsername, smsPassword, smsUrl, sendGridApiKey, mailTemplatePath, systemEmail);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.SENSOR)
            {
                return new SensorPipeline(id, pipelineId, ownerId, DBConnectionString, isHead, isEnd, isVIP, rawData);
            }
            else if (pipelineItemType == PIPELINE_ITEM_TYPE.SWITCH)
            {
                return new SwitchPipeline(id, pipelineId, ownerId, DBConnectionString, isHead, isEnd, isVIP, rawData, localMqttPublishers, mqttUsername, mqttPassword);
            }
            else
            {
                return null;
            }
        }
    }

}