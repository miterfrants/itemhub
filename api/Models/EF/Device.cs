using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class Device
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public long OwnerId { get; set; }
        public DateTime? DeletedAt { get; set; }
        [Required]
        [MaxLength(64)]
        public string Name { get; set; }
        public long? ZoneId { get; set; }
        public Zone Zone { get; set; }
        public string Info { get; set; }
        [MaxLength(128)]
        public bool Online { get; set; }
        public long? Microcontroller { get; set; }
        public FIRMWARE_PROTOCOL Protocol { get; set; }
    }
}
