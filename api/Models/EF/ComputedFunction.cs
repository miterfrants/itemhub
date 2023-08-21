using System;
using System.ComponentModel;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class ComputedFunction
    {
        public long Id { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        [Required]
        public long UserId { get; set; }
        public DateTime? DeletedAt { get; set; }
        [MaxLength(5)]
        public string Pin { get; set; }
        public long? DeviceId { get; set; }
        public long? GroupId { get; set; }
        public long? MonitorId { get; set; }
        public string Func { get; set; }
        public COMPUTED_TARGET Target { get; set; }
        public COMPUTED_SOURCE Source { get; set; }
        public long? SourceDeviceId { get; set; }
        [MaxLength(5)]
        public string SourcePin { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
