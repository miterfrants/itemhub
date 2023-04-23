using System;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class DashboardMonitor : DTOs
        {
            [Required]
            [MaxLength(5)]
            public string Pin { get; set; }
            public DASHBOARD_MONITOR_MODE Mode { get; set; }
            public long DeviceId { get; set; }

            public int Sort { get; set; }

            public int Row { get; set; }

            public int Column { get; set; }

        }

        public partial class DashboardMonitorSorting : DTOs
        {
            public long Id { get; set; }

            public int Sort { get; set; }

        }
    }
}
