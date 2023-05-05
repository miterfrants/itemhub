using System;
using Homo.Api;

namespace Homo.IotApi
{
    public partial class DashboardMonitor
    {
        public long Id { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        [Required]
        public long OwnerId { get; set; }
        public DateTime? DeletedAt { get; set; }
        [Required]
        [MaxLength(5)]
        public string Pin { get; set; }
        [Required]
        public DASHBOARD_MONITOR_MODE Mode { get; set; }
        [Required]
        public long DeviceId { get; set; }

        [Required]
        public int Sort { get; set; }

        [Required]
        public int Row { get; set; }

        [Required]
        public int Column { get; set; }

        public string CustomTitle { get; set; }

    }
}
