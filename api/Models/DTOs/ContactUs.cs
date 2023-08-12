namespace Homo.IotApi
{
    public abstract partial class DTOs
    {
        public partial class ContactUs : DTOs
        {
            public string Subject { get; set; }
            public string Content { get; set; }
            public string Phone { get; set; }
            public string Name { get; set; }
            public string FromMail { get; set; }
            public string[] Type { get; set; }

        }
    }
}
