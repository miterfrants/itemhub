using System;
using Homo.Api;
using System.Collections.Generic;

namespace Homo.IotApi
{
    public partial class Pipeline
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public long OwnerId { get; set; }
        public long? EditedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        [Required]
        [MaxLength(24)]
        public string Title { get; set; }
        public bool IsRun { get; set; }
        public PIPELINE_ITEM_TYPE FirstPieplineItemType { get; set; }
        public long? FirstPipelineItemDeviceId { get; set; }
        public string FirstPipelineItemPin { get; set; }
    }
}
