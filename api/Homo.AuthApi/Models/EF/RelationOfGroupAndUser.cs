using System;

namespace Homo.AuthApi
{
    public partial class RelationOfGroupAndUser
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public DateTime? EditedAt { get; set; }
        public long? EditedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public long UserId { get; set; }
        public long GroupId { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
