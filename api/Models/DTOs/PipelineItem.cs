using System.Drawing;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class PipelineItem
        {
            public long PipelineId { get; set; }
            public long OwnerId { get; set; }
            [MaxLength(24)]
            public string Title { get; set; }
            [Required]
            public PIPELINE_ITEM_TYPE ItemType { get; set; }
            public string Value { get; set; }
            public Point Point { get; set; }
        }

        public interface PipelineItemExpression
        {
        }

        public partial class PipelineScheduleItemExpression : PipelineItemExpression
        {
            public string CronJobExpress { get; set; }
        }

        public partial class PipelineSensorItemExpression : PipelineItemExpression
        {
            public string Operator { get; set; }
            public PIPELINE_DEVICE_OPERATION_TYPE OperationType { get; set; }
            public PIPELINE_DEVICE_STATIC_METHODS StaticMathType { get; set; }
            public decimal Value { get; set; }
        }

        public partial class PipelineSwitchItemExpression : PipelineItemExpression
        {
            public string Operator { get; set; }
            public PIPELINE_DEVICE_OPERATION_TYPE OperationType { get; set; }
            public PIPELINE_DEVICE_STATIC_METHODS StaticMathType { get; set; }
            public decimal Value { get; set; }
        }

        public partial class PipelineDelayItemExpression : PipelineItemExpression
        {
            public decimal Seconds { get; set; }
        }

        public partial class PipelineNetworkItemExpression : PipelineItemExpression
        {
            public string Url { get; set; }
            public string Method { get; set; }
            public string Payload { get; set; }
            public string Header { get; set; }
        }

        public partial class PipelineNotificationItemExpression : PipelineItemExpression
        {
            public PIPELINE_NOTIFICATION_TYPE NotificationType { get; set; }
            public string Target { get; set; }
        }
    }
}
