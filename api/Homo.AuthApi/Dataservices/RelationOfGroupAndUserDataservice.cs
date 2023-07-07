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

        public static List<ViewRelationOfGroupAndUser> GetRelationByGroupId(DBContext dbContext, long userId, long groupId, string groupName)
        {
            return dbContext.RelationOfGroupAndUser
                .Where(x => x.DeletedAt == null && x.GroupId == groupId && x.CreatedBy == userId)
                .Join(dbContext.User, r => r.UserId, user => user.Id, (relation, user) =>
                new
                {
                    user,
                    relation
                })
                .Join(dbContext.Group, record => record.relation.GroupId, group => group.Id, (record, group) => new
                {
                    user = record.user,
                    relation = record.relation,
                    group = group
                })
                .Where(x =>
                    x.user.DeletedAt != null
                    && x.group.DeletedAt != null
                    && x.group.Name.Contains(groupName)
                    && x.group.CreatedBy == userId
                )
                .Select(x => new ViewRelationOfGroupAndUser
                {
                    Id = x.relation.Id,
                    UserId = x.relation.UserId,
                    GroupId = x.relation.GroupId,
                    GroupName = x.group.Name,
                    Roles = x.group.Roles,
                    Email = x.user.Email
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
        public string Email { get; set; }
    }
}