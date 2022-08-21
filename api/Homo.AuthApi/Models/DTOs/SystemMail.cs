using System;
using System.Collections.Generic;
using Homo.Api;

namespace Homo.AuthApi
{

    public abstract partial class DTOs
    {
        public partial class SendEmail
        {
            public string Email { get; set; }

        }

        public partial class CustomEmail
        {
            [Required]
            public string TemplateName { get; set; }
            [Required]
            public string Email { get; set; }
            [Required]
            public string Subject { get; set; }
            public string Content { get; set; }
            public Boolean IsUser { get; set; }
            public Dictionary<string, string> Variable { get; set; }

        }

    }

}