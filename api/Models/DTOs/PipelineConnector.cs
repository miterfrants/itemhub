using System.Drawing;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class PipelineConnector
        {
            public long PipelineId { get; set; }
            public long OwnerId { get; set; }
            public long SourcePipelineItemId { get; set; }
            public long DestPipelineItemId { get; set; }

        }


    }
}
