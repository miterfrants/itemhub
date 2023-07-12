using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class GroupDevice
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public long? EditedBy { get; set; }
        [Required]
        public long DeviceId { get; set; }
        [Required]
        public long GroupId { get; set; }
        [Required]
        public long UserId { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
