using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class Log
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public long? DeviceId { get; set; }
        public long? UserId { get; set; }
        [MaxLength(5)]
        public string Pin { get; set; }
        [Required]
        public string Message { get; set; }
        public LOG_TYPE LogType { get; set; }
        public long? PipelineId { get; set; }
    }
}
