using System;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class DevicePinSwitch : DTOs
        {
            [Required]
            [MaxLength(3)]
            public string Pin { get; set; }
            [Required]
            public byte Mode { get; set; }
            public decimal? Value { get; set; }
        }

        public partial class DevicePinSwitchValue : DTOs
        {
            public decimal Value { get; set; }
        }
    }
}
