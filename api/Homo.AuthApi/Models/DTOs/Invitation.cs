using System;

namespace Homo.AuthApi
{
    public abstract partial class DTOs
    {
        public partial class Invitation : DTOs
        {
            public string Email { get; set; }
        }
    }
}
