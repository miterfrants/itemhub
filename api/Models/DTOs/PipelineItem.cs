using System.Drawing;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class PipelineItem
        {
            public long PipelineId { get; set; }
            public long OwnerId { get; set; }
            [MaxLength(24)]
            public string Title { get; set; }
            [Required]
            public PIPELINE_ITEM_TYPE ItemType { get; set; }
            public string Value { get; set; }
            public Point Point { get; set; }
        }
    }
}
