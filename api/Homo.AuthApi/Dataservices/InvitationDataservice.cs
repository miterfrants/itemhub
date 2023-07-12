using System;
using System.Collections.Generic;
using System.Linq;
using Homo.Core.Helpers;

namespace Homo.AuthApi
{
    public class InvitationDataservice
    {
        public static List<Invitation> GetAll(DBContext dbContext, long userId, long groupId)
        {
            return dbContext.Invitation
                .Where(x =>
                    x.DeletedAt == null
                    && x.CreatedBy == userId
                    && x.GroupId == groupId
                )
                .OrderByDescending(x => x.Id)
                .ToList();
        }

        public static List<Invitation> BatchCreate(DBContext dbContext, long userId, long groupId, List<string> emails)
        {
            var result = new List<Invitation>();
            emails.ForEach(email =>
            {
                Invitation record = new Invitation();
                record.CreatedBy = userId;
                record.GroupId = groupId;
                record.CreatedAt = System.DateTime.Now;
                record.Email = email;
                record.Token = CryptographicHelper.GetSpecificLengthRandomString(24, true);
                dbContext.Invitation.Add(record);
                result.Add(record);
            });
            dbContext.SaveChanges();
            return result;
        }

        public static void BatchDelete(DBContext dbContext, long userId, long groupId, List<long> ids)
        {
            var invitations = dbContext.Invitation
                .Where(x =>
                    x.CreatedBy == userId
                    && x.GroupId == groupId
                    && x.DeletedAt == null
                    && (ids == null || ids.Contains(x.Id))
                ).UpdateFromQuery(x => new Invitation()
                {
                    DeletedAt = System.DateTime.Now
                });
        }


        public static Invitation GetAvaiableOne(DBContext dbContext, long groupId, long invitationId, string token)
        {
            var expiration = System.DateTime.Now.AddHours(-1);
            return dbContext.Invitation
                .Where(x =>
                    x.GroupId == groupId
                    && x.DeletedAt == null
                    && x.Id == invitationId)
                .FirstOrDefault();
        }

        public static void DeleteWithTrack(DBContext dbContext, Invitation record)
        {
            record.DeletedAt = System.DateTime.Now;
            dbContext.SaveChanges();
        }
    }
}
