using System;
using Homo.Api;
using System.Collections.Generic;
using System.Drawing;

namespace Homo.IotApi
{
    public partial class PipelineConnector
    {
        public long Id { get; set; }
        public long PipelineId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public long OwnerId { get; set; }
        public long? EditedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public long SourcePipelineItemId { get; set; }
        public long DestPipelineItemId { get; set; }

    }
}
