using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class Microcontroller
    {
        public long Id { get; set; }
        [Required]
        [MaxLength(128)]
        public string Key { get; set; }
        [Required]
        public string Pins { get; set; }
        public DateTime? DeletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? EditedBy { get; set; }
        [MaxLength(512)]
        public string Memo { get; set; }
    }
}
