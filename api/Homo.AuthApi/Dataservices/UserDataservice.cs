using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Homo.AuthApi
{
    public class UserDataservice
    {

        public static List<User> GetList(DBContext dbContext, int page, int limit, string email, List<long> userIds)
        {
            return dbContext.User
                .Where(
                    x => x.DeletedAt == null
                    && (email == null || x.Email.Contains(email))
                    && (userIds == null || userIds.Contains(x.Id))
                )
                .OrderByDescending(x => x.Id)
                .Skip(limit * (page - 1))
                .Take(limit)
                .ToList();
        }

        public static int GetRowNum(DBContext dbContext, string email, List<long> userIds)
        {
            return dbContext.User
                .Where(
                    x => x.DeletedAt == null
                    && (email == null || x.Email.Contains(email))
                    && (userIds == null || userIds.Contains(x.Id))
                )
                .Count();
        }

        public static List<User> GetAllByIds(List<long> userIds, DBContext dbContext)
        {
            return dbContext.User
                .Where(
                    x => x.DeletedAt == null &&
                    (userIds == null || userIds.Contains(x.Id))
                )
                .OrderByDescending(x => x.Id)
                .ToList();
        }

        public static User GetOne(DBContext dbContext, long id, bool asNoTracking = false)
        {
            DbSet<User> dbSet = dbContext.User;
            IQueryable<User> queryablUser = dbSet;
            if (asNoTracking)
            {
                queryablUser = queryablUser.AsNoTracking();
            }
            return queryablUser.Where(x => x.Id == id && x.DeletedAt == null).FirstOrDefault();
        }

        public static User GetOneByEmail(DBContext dbContext, string email, bool asNoTracking = false)
        {
            DbSet<User> dbSet = dbContext.User;
            IQueryable<User> queryablUser = dbSet;
            if (asNoTracking)
            {
                queryablUser = queryablUser.AsNoTracking();
            }
            return queryablUser.Where(x => x.Email == email && x.DeletedAt == null).FirstOrDefault();
        }

        public static User GetEarlyBirdByEmail(DBContext dbContext, string email)
        {
            return dbContext.User.Where(x => x.Email == email && x.DeletedAt == null && x.HashPhone == null).FirstOrDefault();
        }

        public static User GetSurveyEmail(DBContext dbContext, string email)
        {
            return dbContext.User.Where(x => x.Email == email && x.DeletedAt == null && x.HashPhone != null).FirstOrDefault();
        }

        public static User GetOneByHashPhone(DBContext dbContext, string hashPhone)
        {
            return dbContext.User.Where(x => x.HashPhone == hashPhone && x.DeletedAt == null).FirstOrDefault();
        }

        public static User GetOneBySocialMediaSub(DBContext dbContext, SocialMediaProvider provider, string sub)
        {
            return dbContext.User.Where(
                x =>
                (
                    (provider == SocialMediaProvider.FACEBOOK && x.FacebookSub == sub)
                    || (provider == SocialMediaProvider.GOOGLE && x.GoogleSub == sub)
                    || (provider == SocialMediaProvider.LINE && x.LineSub == sub)
                )
                && x.DeletedAt == null
            ).FirstOrDefault();
        }

        public static User SignUpWithSocialMedia(
            DBContext dbContext,
            SocialMediaProvider provider,
            string sub,
            string email,
            string pseudonymousPhone,
            string encryptPhone,
            string hashPhone,
            string fullname,
            string picture,
            string firstName,
            string lastName,
            DateTime? birthday = null
        )
        {
            User newUser = new User()
            {
                Email = email,
                CreatedAt = DateTime.Now,
                Username = fullname,
                FirstName = firstName,
                LastName = lastName,
                Profile = picture,
                Birthday = birthday,
                PseudonymousPhone = pseudonymousPhone,
                EncryptPhone = encryptPhone,
                HashPhone = hashPhone,
                Status = true
            };
            if (provider == SocialMediaProvider.FACEBOOK)
            {
                newUser.FacebookSub = sub;
            }
            else if (provider == SocialMediaProvider.GOOGLE)
            {
                newUser.GoogleSub = sub;
            }
            else if (provider == SocialMediaProvider.LINE)
            {
                newUser.LineSub = sub;
            }
            try
            {
                dbContext.User.Add(newUser);
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.ToString());
            }
            return newUser;
        }

        public static User SignUp(DBContext dbContext, string email, string password, string pseudonymousPhone, string encryptPhone, string hashPhone, string firstName, string lastName, string salt, string hash, DateTime? birthday = null)
        {
            User newUser = new User()
            {
                Email = email,
                Salt = salt,
                Hash = hash,
                CreatedAt = DateTime.Now,
                Status = true,
                FirstName = firstName,
                LastName = lastName,
                Birthday = birthday,
                PseudonymousPhone = pseudonymousPhone,
                EncryptPhone = encryptPhone,
                HashPhone = hashPhone,
                DeletedAt = null
            };
            try
            {
                dbContext.User.Add(newUser);
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.ToString());
            }
            return newUser;
        }



        public static User RegisterForEarlyAdaptor(DBContext dbContext, long id, string encryptPhone, string pseudonymousPhone, string hashPhone, string salt, string hash)
        {
            User record = new User() { Id = id };
            dbContext.Attach(record);
            record.EncryptPhone = encryptPhone;
            record.PseudonymousPhone = pseudonymousPhone;
            record.HashPhone = hashPhone;
            record.Salt = salt;
            record.Hash = hash;
            record.EditedAt = DateTime.Now;
            record.EditedBy = id;
            dbContext.SaveChanges();
            return record;
        }

        public static void SetUserToForgotPasswordState(DBContext dbContext, long userId)
        {
            var record = new User() { Id = userId };
            dbContext.User.Attach(record);
            record.ForgotPasswordAt = DateTime.Now;
            dbContext.SaveChanges();
        }

        public static void ResetPassword(DBContext dbContext, long userId, string salt, string hash)
        {
            var record = new User() { Id = userId };
            dbContext.User.Attach(record);
            record.Salt = salt;
            record.Hash = hash;
            dbContext.SaveChanges();
        }

        public static void RemoveFbSub(DBContext dbContext, string fbSub, string confirmCode)
        {
            User user = dbContext.User.Where(x => x.FacebookSub == fbSub && x.DeletedAt == null).FirstOrDefault();
            user.FacebookSub = null;
            user.FbSubDeletionConfirmCode = confirmCode;
            user.EditedBy = 0;
            user.EditedAt = DateTime.Now;
            dbContext.SaveChanges();
        }

        public static User GetOneByConfirmCode(string confirmCode, DBContext dbContext)
        {
            return dbContext.User.Where(x => x.FbSubDeletionConfirmCode == confirmCode && x.DeletedAt == null).FirstOrDefault();
        }

        public static void Update(DBContext dbContext, long id, DTOs.UpdateMePseudonymous dto, long editedBy)
        {
            User record = dbContext.User.Where(x => x.Id == id).FirstOrDefault();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                try
                {
                    var prop = record.GetType().GetProperty(propOfDTO.Name);
                    prop.SetValue(record, value);
                }
                catch (System.Exception ex)
                {
                    throw new Exception(propOfDTO.Name + ", " + ex.Message + "\r\n" + ex.StackTrace);
                }
            }
            record.EditedAt = DateTime.Now;
            record.EditedBy = editedBy;
            dbContext.SaveChanges();
        }

        public static void UpdateName(DBContext dbContext, long id, DTOs.UpdateName dto, long editedBy)
        {
            User record = dbContext.User.Where(x => x.Id == id).FirstOrDefault();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                try
                {
                    var prop = record.GetType().GetProperty(propOfDTO.Name);
                    prop.SetValue(record, value);
                }
                catch (System.Exception ex)
                {
                    throw new Exception(propOfDTO.Name + ", " + ex.Message + "\r\n" + ex.StackTrace);
                }
            }
            record.EditedAt = DateTime.Now;
            record.EditedBy = editedBy;
            dbContext.SaveChanges();
        }

        public static void UpdatePhone(DBContext dbContext, long id, string encryptPhone, string pseudonymousPhone, long editedBy)
        {
            User record = new User() { Id = id };
            dbContext.Attach(record);
            record.EncryptPhone = encryptPhone;
            record.PseudonymousPhone = pseudonymousPhone;
            record.EditedAt = DateTime.Now;
            record.EditedBy = editedBy;
            dbContext.SaveChanges();
        }

        public static void BatchDelete(DBContext dbContext, long editedBy, List<long> ids)
        {
            foreach (int id in ids)
            {
                User record = new User { Id = id };
                dbContext.Attach<User>(record);
                record.DeletedAt = DateTime.Now;
                record.EditedBy = editedBy;
            }
            dbContext.SaveChanges();
        }

        public static void Delete(DBContext dbContext, long id, long editedBy)
        {
            User record = dbContext.User.Where(x => x.Id == id).FirstOrDefault();
            record.DeletedAt = DateTime.Now;
            record.EditedBy = editedBy;
            dbContext.SaveChanges();
        }

        public static List<User> GetOverPlanAll(DBContext dbContext)
        {
            return dbContext.User.Where(x => x.DeletedAt == null && x.IsOverSubscriptionPlan == true).ToList();
        }


        public static void SetIsOverSubscriptionPlan(DBContext dbContext, long id)
        {
            dbContext.User.Where(x => x.DeletedAt == null && x.Id == id).UpdateFromQuery(x => new User() { IsOverSubscriptionPlan = true });
        }
    }
}