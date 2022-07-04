using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class Trigger
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public long OwnerId { get; set; }
        public DateTime? DeletedAt { get; set; }
        [Required]
        public long SourceDeviceId { get; set; }
        [Required]
        [MaxLength(4)]
        public string SourcePin { get; set; }
        [Required]
        public decimal SourceThreshold { get; set; }
        public Device SourceDevice { get; set; }
        public long? DestinationDeviceId { get; set; }
        [MaxLength(4)]
        public string DestinationPin { get; set; }
        public Device DestinationDevice { get; set; }
        public decimal? DestinationDeviceTargetState { get; set; }
        [Required]
        public TRIGGER_OPERATOR Operator { get; set; }
        public string Name { get; set; }
        [Required]
        public TRIGGER_TYPE Type { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public TRIGGER_NOTIFICATION_PERIOD NotificationPeriod { get; set; }

    }
}
