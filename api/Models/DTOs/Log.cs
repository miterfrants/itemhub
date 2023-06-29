using System;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class Log : DTOs
        {
            [Required]
            public string Message { get; set; }
            public long DeviceId { get; set; }
            public long? UserId { get; set; }
            public string Pin { get; set; }
        }
    }
}
