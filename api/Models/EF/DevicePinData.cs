using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class DevicePinSensor
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public long OwnerId { get; set; }
        public DateTime? DeletedAt { get; set; }
        [Required]
        [MaxLength(3)]
        public string Pin { get; set; }
        [Required]
        public byte Mode { get; set; }
        public decimal? Value { get; set; }
        [Required]
        public long DeviceId { get; set; }
        public Device Device { get; set; }
    }
}
