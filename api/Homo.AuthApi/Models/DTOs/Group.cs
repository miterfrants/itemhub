using System;

namespace Homo.AuthApi
{
    public abstract partial class DTOs
    {
        public partial class Group : DTOs
        {
            public string Name { get; set; }
        }

        public partial class JoinGroup : DTOs
        {
            public string Token { get; set; }
        }
    }
}
