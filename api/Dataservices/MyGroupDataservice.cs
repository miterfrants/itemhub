using System;
using System.Collections.Generic;
using System.Linq;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public class MyGroupDataservice
    {
        public static List<Group> GetList(DBContext dbContext, int page, int limit, long userId, string name)
        {
            return dbContext.Group
                .Where(x =>
                    x.DeletedAt == null
                    && x.CreatedBy == userId
                    && (name == null || x.Name.Contains(name))
                )
                .OrderByDescending(x => x.Id)
                .Skip(limit * (page - 1))
                .Take(limit)
                .ToList();
        }

        public static List<Group> GetAll(DBContext dbContext, long userId, string name)
        {
            return dbContext.Group
                .Where(x =>
                    x.DeletedAt == null
                    && x.CreatedBy == userId
                    && (name == null || x.Name.Contains(name))
                )
                .OrderByDescending(x => x.Id)
                .ToList();
        }
        public static int GetRowNum(DBContext dbContext, long userId, string name)
        {
            return dbContext.Group
                .Where(x =>
                    x.DeletedAt == null
                    && x.CreatedBy == userId
                    && (name == null || x.Name.Contains(name))
                )
                .Count();
        }

        public static Group GetOne(DBContext dbContext, long userId, long id)
        {
            return dbContext.Group.FirstOrDefault(x => x.DeletedAt == null && x.Id == id && x.CreatedBy == userId);
        }

        public static Group GetOneByName(DBContext dbContext, long userId, string name)
        {
            return dbContext.Group.FirstOrDefault(x => x.DeletedAt == null && x.Name == name && x.CreatedBy == userId);
        }

        public static Group Create(DBContext dbContext, long createdBy, Homo.AuthApi.DTOs.Group dto)
        {
            Group record = new Group();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedBy = createdBy;
            record.Roles = "[]";
            dbContext.Group.Add(record);
            dbContext.SaveChanges();
            record.Roles = $"[\"group_{record.Id}\"]";
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(DBContext dbContext, long userId, List<long?> ids)
        {
            foreach (int id in ids)
            {
                Group record = new Group { Id = id, CreatedBy = userId };
                dbContext.Attach<Group>(record);
                record.DeletedAt = DateTime.Now;
                record.EditedBy = userId;
            }
            dbContext.SaveChanges();
        }

        public static void Update(DBContext dbContext, int id, long userId, Homo.AuthApi.DTOs.Group dto)
        {
            Group record = dbContext.Group.Where(x => x.Id == id && x.CreatedBy == userId).FirstOrDefault();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.EditedAt = DateTime.Now;
            record.EditedBy = userId;
            dbContext.SaveChanges();
        }

        public static void Delete(DBContext dbContext, long id, long userId)
        {
            Group record = dbContext.Group.Where(x => x.Id == id && x.CreatedBy == userId).FirstOrDefault();
            record.DeletedAt = DateTime.Now;
            record.EditedBy = userId;
            dbContext.SaveChanges();
        }
    }
}
