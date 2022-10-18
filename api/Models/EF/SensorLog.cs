using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class SensorLog
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public long OwnerId { get; set; }
        public DateTime? DeletedAt { get; set; }
        [Required]
        [MaxLength(5)]
        public string Pin { get; set; }
        [Required]
        public decimal? Value { get; set; }
        [Required]
        public long DeviceId { get; set; }
        public virtual Device Device { get; set; }
    }
}
