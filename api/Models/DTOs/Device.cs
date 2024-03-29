using System;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class DevicePayload : DTOs
        {
            [Required]
            [MaxLength(64)]
            public string Name { get; set; }
            public long? ZoneId { get; set; }
            public string Info { get; set; }
            public long? Microcontroller { get; set; }
            public FIRMWARE_PROTOCOL Protocol { get; set; }
            public bool IsOfflineNotification { get; set; }
            public string OfflineNotificationTarget { get; set; }
        }
    }
}
