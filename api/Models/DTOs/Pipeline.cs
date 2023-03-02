using System;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class Pipeline : DTOs
        {
            [Required]
            [MaxLength(24)]
            public string Title { get; set; }
            public bool IsRun { get; set; }
        }
    }
}
