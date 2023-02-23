using System;
using System.Linq;
using System.Collections.Generic;

namespace Homo.AuthApi
{
    public class RelationOfGroupAndUserDataservice
    {
        public static List<ViewRelationOfGroupAndUser> GetRelationByUserId(DBContext dbContext, long userId)
        {
            return dbContext.RelationOfGroupAndUser
                .Where(x => x.DeletedAt == null && x.UserId == userId)
                .Join(dbContext.Group, s => s.GroupId, d => d.Id, (s, d) => new ViewRelationOfGroupAndUser
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    GroupId = s.GroupId,
                    GroupName = d.Name,
                    Roles = d.Roles
                })
                .ToList();
        }

        public static void AddPermissionGroups(long createdBy, long userId, List<long> groupIds, DBContext dbContext)
        {
            foreach (long groupId in groupIds)
            {
                dbContext.RelationOfGroupAndUser.Add(new RelationOfGroupAndUser()
                {
                    UserId = userId,
                    GroupId = groupId,
                    CreatedBy = createdBy,
                    CreatedAt = DateTime.Now
                });
            }
            dbContext.SaveChanges();
        }

        public static void DeletePermissionGroups(long editedBy, long userId, List<long> ids, DBContext dbContext)
        {
            foreach (long id in ids)
            {
                RelationOfGroupAndUser relation = new RelationOfGroupAndUser { Id = id };
                dbContext.Attach<RelationOfGroupAndUser>(relation);
                relation.DeletedAt = DateTime.Now;
                relation.EditedBy = editedBy;
            }
            dbContext.SaveChanges();
        }

        public static bool IsVIP(DBContext dbContext, long userId)
        {
            List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(dbContext, userId);
            string[] roles = permissions.SelectMany(x => Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(x.Roles)).ToArray();
            bool isVIP = roles.Any(x => x == "VIP");
            return isVIP;
        }
    }

    public class ViewRelationOfGroupAndUser
    {
        public long Id { get; set; }
        public long GroupId { get; set; }
        public long UserId { get; set; }
        public string Roles { get; set; }
        public string GroupName { get; set; }
    }
}