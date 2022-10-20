using System;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class DevicePin : DTOs
        {
            public long Id { get; set; }
            public DateTime? CreatedAt { get; set; }
            public DateTime? EditedAt { get; set; }
            public long OwnerId { get; set; }
            public DateTime? DeletedAt { get; set; }
            [Required]
            [MaxLength(5)]
            public string Pin { get; set; }
            [Required]
            public DEVICE_MODE Mode { get; set; }
            public string Name { get; set; }
            public decimal? Value { get; set; }
            [Required]
            public long DeviceId { get; set; }
            public Homo.IotApi.Device Device { get; set; }

        }

        public partial class DevicePinSummary : DTOs
        {
            public long Id { get; set; }
            [Required]
            [MaxLength(5)]
            public string Pin { get; set; }
            public decimal? Value { get; set; }

        }

        public partial class CreateDevicePin : DTOs
        {
            public long Id { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? EditedAt { get; set; }
            public long OwnerId { get; set; }
            public DateTime? DeletedAt { get; set; }
            [Required]
            [MaxLength(5)]
            public string Pin { get; set; }
            [Required]
            public DEVICE_MODE Mode { get; set; }
            public string Name { get; set; }
            public decimal? Value { get; set; }
            [Required]
            public long DeviceId { get; set; }
            public Homo.IotApi.Device Device { get; set; }
            public decimal? LastValue { get; set; }
            public DateTime? LastCreatedAt { get; set; }

        }

        public partial class UpdateDevicePinName : DTOs
        {
            public string Name { get; set; }
        }

        public partial class DevicePinsData : DTOs
        {
            public string Pin { get; set; }
            public decimal? Value { get; set; }
            public DEVICE_MODE Mode { get; set; }
            public string Name { get; set; }

        }

    }
}
