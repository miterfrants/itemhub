using System;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class PipelineExecuteLog
        {
            public long PipelineId { get; set; }
            public long ItemId { get; set; }
            public string Raw { get; set; }
            public bool IsHead { get; set; }
            public bool IsEnd { get; set; }
            public string Message { get; set; }
        }

    }
}
