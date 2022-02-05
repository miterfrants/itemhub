using System;
using Homo.Api;

namespace Homo.IotApi
{
    public abstract partial class DTOs
    {

        public partial class DevicePinSensor : DTOs
        {
            public decimal Value { get; set; }
        }
    }
}
