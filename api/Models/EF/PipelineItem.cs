using System;
using Homo.Api;
using System.Collections.Generic;
using System.Drawing;

namespace Homo.IotApi
{
    public partial class PipelineItem
    {
        public long Id { get; set; }
        public long PipelineId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public long OwnerId { get; set; }
        public long? EditedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        [MaxLength(24)]
        public string Title { get; set; }
        [Required]
        public PIPELINE_ITEM_TYPE ItemType { get; set; }
        public string Value { get; set; }
        public Point Point { get; set; }

    }
}
