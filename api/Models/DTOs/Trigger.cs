using System;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class Trigger : DTOs
        {

            public long SourceDeviceId { get; set; }
            [Required]
            [MaxLength(5)]
            public string SourcePin { get; set; }
            public decimal SourceThreshold { get; set; }
            public long? DestinationDeviceId { get; set; }
            [MaxLength(5)]
            public string DestinationPin { get; set; }
            public decimal? DestinationDeviceTargetState { get; set; }
            public TRIGGER_OPERATOR Operator { get; set; }
            public string Name { get; set; }
            public TRIGGER_TYPE Type { get; set; }
            public string Email { get; set; }
            public TRIGGER_NOTIFICATION_PERIOD NotificationPeriod { get; set; }
        }
    }
}
