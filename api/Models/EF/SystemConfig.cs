using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class SystemConfig
    {
        public long Id { get; set; }
        [Required]
        [MaxLength(64)]
        public string Key { get; set; }
        [Required]
        [MaxLength(4096)]
        public string Value { get; set; }

    }
}
