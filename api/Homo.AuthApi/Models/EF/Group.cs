using System;
using Homo.Api;

namespace Homo.AuthApi
{
    public partial class Group
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public DateTime? EditedAt { get; set; }
        public long? EditedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool? IsDeleted { get; set; }

        [Required]
        [MaxLength(128)]
        public string Name { get; set; }

        [Required]
        [MaxLength(512)]
        public string Roles { get; set; }
    }
}
