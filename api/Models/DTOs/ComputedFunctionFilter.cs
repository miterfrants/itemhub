namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class ComputedFunctionFilterByDevicePin : DTOs
        {
            public long? deviceId { get; set; }
            public string pin { get; set; }
        }

    }
}
