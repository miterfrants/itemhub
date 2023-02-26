using System;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class PipelineExecuteLog
        {
            public long PipelineId { get; set; }
            public long? CurrentPipelineId { get; set; }
            public bool IsCompleted { get; set; }
            public string Log { get; set; }

        }

    }
}
