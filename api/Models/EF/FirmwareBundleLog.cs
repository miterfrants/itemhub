using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class FirmwareBundleLog
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        [Required]
        public long OwnerId { get; set; }
        [Required]
        public long DeviceId { get; set; }

        [Required]
        [MaxLength(32)]
        public string BundleId { get; set; }

        [Required]
        public long Microcontroller { get; set; }

        public string Filename { get; set; }
        public FIRMWARE_PROTOCOL Protocol { get; set; }
    }
}
