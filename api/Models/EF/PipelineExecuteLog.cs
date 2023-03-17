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
        public long OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public long ItemId { get; set; }
        public string Raw { get; set; }
        public bool IsHead { get; set; }
        public bool IsEnd { get; set; }
        public string Message { get; set; }
    }
}
