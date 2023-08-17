namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class ComputedFunctionFilterByDevicePin : DTOs
        {
            public long? deviceId { get; set; }
            public string pin { get; set; }
        }

        public partial class CreateComputedFunction : DTOs
        {
            public long? deviceId { get; set; }
            public string pin { get; set; }
            public long? monitorId { get; set; }
            public long? groupId { get; set; }
            public string func { get; set; }
            public COMPUTED_TARGET target { get; set; }
            public COMPUTED_SOURCE source { get; set; }
            public long? sourceDeviceId { get; set; }
            public string sourcePin { get; set; }
        }


        public partial class UpdateComputedFunction : DTOs
        {
            public string func { get; set; }
            public long? sourceDeviceId { get; set; }
            public string sourcePin { get; set; }
        }
    }
}
