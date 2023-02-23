using System;
using Homo.Api;

namespace Homo.AuthApi
{
    public partial class User
    {
        public long Id { get; set; }

        [Required]
        [MaxLength(64)]
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public long? CreatedBy { get; set; }
        public long? EditedBy { get; set; }
        [MaxLength(512)]
        public string Salt { get; set; }
        [MaxLength(512)]
        public string Hash { get; set; }
        public bool Status { get; set; }
        public DateTime? ForgotPasswordAt { get; set; }
        public bool? IsManager { get; set; }
        [MaxLength(128)]
        public string Username { get; set; }
        [MaxLength(512)]
        public string Profile { get; set; }
        [MaxLength(128)]
        public string FacebookSub { get; set; }
        [MaxLength(128)]
        public string LineSub { get; set; }
        [MaxLength(128)]
        public string GoogleSub { get; set; }

        [MaxLength(64)]
        public string FirstName { get; set; }
        [MaxLength(64)]

        public string LastName { get; set; }
        [MaxLength(1)]
        public byte? Gender { get; set; }

        [MaxLength(64)]
        public string County { get; set; }
        [MaxLength(64)]
        public string City { get; set; }
        [MaxLength(10)]
        public string Zip { get; set; }
        public DateTime? Birthday { get; set; }
        [MaxLength(32)]
        public string FbSubDeletionConfirmCode { get; set; }
        [MaxLength(20)]
        public string PseudonymousPhone { get; set; }
        public string PseudonymousAddress { get; set; }
        public string EncryptPhone { get; set; }
        public string HashPhone { get; set; }
        public string EncryptAddress { get; set; }
        public bool? IsOverSubscriptionPlan { get; set; }
        public DateTime? SendOverPlanNotificationAt { get; set; }
        public int SendOverPlanNotificationCount { get; set; }
        public bool IsEarlyBird { get; set; }
    }
}
