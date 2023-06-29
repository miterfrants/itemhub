using System;
using System.Collections.Generic;
using System.Linq;

namespace Homo.AuthApi
{
    public class GroupDataservice
    {
        public static List<Group> GetList(DBContext dbContext, int page, int limit, string name)
        {
            return dbContext.Group
                .Where(x =>
                    x.DeletedAt == null
                    && (name == null || x.Name.Contains(name))
                )
                .OrderByDescending(x => x.Id)
                .Skip(limit * (page - 1))
                .Take(limit)
                .ToList();
        }

        public static List<Group> GetAll(DBContext dbContext, string name)
        {
            return dbContext.Group
                .Where(x =>
                    x.DeletedAt == null
                    && (name == null || x.Name.Contains(name))
                )
                .OrderByDescending(x => x.Id)
                .ToList();
        }
        public static int GetRowNum(DBContext dbContext, string name)
        {
            return dbContext.Group
                .Where(x =>
                    x.DeletedAt == null
                    && (name == null || x.Name.Contains(name))
                )
                .Count();
        }

        public static Group GetOne(DBContext dbContext, long id)
        {
            return dbContext.Group.FirstOrDefault(x => x.DeletedAt == null && x.Id == id);
        }

        public static Group Create(DBContext dbContext, long createdBy, DTOs.Group dto)
        {
            Group record = new Group();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedBy = createdBy;
            dbContext.Group.Add(record);
            dbContext.SaveChanges();
            record.Roles = $"[\"group_{record.Id}\"]";
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(DBContext dbContext, long editedBy, List<long?> ids)
        {
            foreach (int id in ids)
            {
                Group record = new Group { Id = id };
                dbContext.Attach<Group>(record);
                record.DeletedAt = DateTime.Now;
                record.EditedBy = editedBy;
            }
            dbContext.SaveChanges();
        }

        public static void Update(DBContext dbContext, int id, long editedBy, DTOs.Group dto)
        {
            Group record = dbContext.Group.Where(x => x.Id == id).FirstOrDefault();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.EditedAt = DateTime.Now;
            record.EditedBy = editedBy;
            dbContext.SaveChanges();
        }

        public static void Delete(DBContext dbContext, long id, long editedBy)
        {
            Group record = dbContext.Group.Where(x => x.Id == id).FirstOrDefault();
            record.DeletedAt = DateTime.Now;
            record.EditedBy = editedBy;
            dbContext.SaveChanges();
        }
    }
}
