using System;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class DeviceUploadedImage : DTOs
        {
            public long Id { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? EditedAt { get; set; }
            public DateTime? DeletedAt { get; set; }
            public long? EditedBy { get; set; }
            [Required]
            public long OwnerId { get; set; }
            [Required]
            public long DeviceId { get; set; }
            [Required]
            [MaxLength(128)]
            public string Filename { get; set; }
        }
    }
}
