namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class Firmware : DTOs
        {

            public string ZipPassword { get; set; }
        }


        public class McuPin
        {
            public string Name { get; set; }
            public string Value { get; set; }
        }
    }
}
