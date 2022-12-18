using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class Log
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public long DeviceId { get; set; }
        [Required]
        public string Message { get; set; }
    }
}
