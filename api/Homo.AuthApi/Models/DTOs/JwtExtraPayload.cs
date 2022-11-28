using System.Collections.Generic;

namespace Homo.AuthApi
{
    public abstract partial class DTOs
    {
        public class JwtPayload
        {
            public int exp { get; set; }
            public string role { get; set; }
        }
        public class JwtExtraPayload
        {
            public long Id { get; set; }
            public string Email { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string County { get; set; }
            public string City { get; set; }
            public string FacebookSub { get; set; }
            public string GoogleSub { get; set; }
            public string LineSub { get; set; }
            public string Profile { get; set; }
            public string PseudonymousHomePhone { get; set; }
            public string PseudonymousPhone { get; set; }
            public string PseudonymousAddress { get; set; }
            public string Phone { get; set; }
            public bool? IsOverSubscriptionPlan { get; set; }
        }
    }
}
