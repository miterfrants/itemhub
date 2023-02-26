using System;
using Homo.Api;
using System.Collections.Generic;
using System.Drawing;

namespace Homo.IotApi
{
    public partial class PipelineExecuteLog
    {
        public long Id { get; set; }
        public long PipelineId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public long? CurrentPipelineId { get; set; }
        public bool IsCompleted { get; set; }
        public string Log { get; set; }
    }
}
