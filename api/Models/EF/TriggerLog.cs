using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class TriggerLog
    {
        public long Id { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; }
        [Required]
        public long TriggerId { get; set; }
        [Required]
        public string Raw { get; set; }
        [Required]
        public TRIGGER_TYPE Type { get; set; }
        [Required]
        public long OwnerId { get; set; }

    }
}
