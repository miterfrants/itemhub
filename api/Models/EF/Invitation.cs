using System;
using Homo.Api;

namespace Homo.AuthApi
{
    public partial class Invitation
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public long GroupId { get; set; }
        public string Token { get; set; }

        [Required]
        [MaxLength(128)]
        public string Email { get; set; }

        [Required]
        public INVITATION_STATUS Status { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
