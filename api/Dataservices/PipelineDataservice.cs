using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class PipelineDataservice
    {
        public static List<Pipeline> GetList(IotDbContext dbContext, long ownerId, int page, int limit, string title)
        {
            return dbContext.Pipeline
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && (title == null || x.Title.Contains(title))
                )
                .OrderByDescending(x => x.Id)
                .Skip(limit * (page - 1))
                .Take(limit)
                .ToList();
        }

        public static int GetRowNum(IotDbContext dbContext, long ownerId, string title)
        {
            return dbContext.Pipeline
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && (title == null || x.Title.Contains(title))
                )
                .Count();
        }

        public static Pipeline GetOne(IotDbContext dbContext, long ownerId, long id)
        {
            return dbContext.Pipeline.FirstOrDefault(x =>
                x.DeletedAt == null
                && x.Id == id
                && x.OwnerId == ownerId
            );
        }

        public static Pipeline Create(IotDbContext dbContext, long ownerId, DTOs.Pipeline dto)
        {
            Pipeline record = new Pipeline();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            dbContext.Pipeline.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(IotDbContext dbContext, long ownerId, List<long> ids)
        {
            foreach (long id in ids)
            {
                Pipeline record = new Pipeline { Id = id, OwnerId = ownerId };
                dbContext.Attach<Pipeline>(record);
                record.DeletedAt = DateTime.Now;
            }
            dbContext.SaveChanges();
        }

        public static void Update(IotDbContext dbContext, long ownerId, long editedBy, long id, DTOs.Pipeline dto)
        {
            Pipeline record = dbContext.Pipeline.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
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

        public static void Delete(IotDbContext dbContext, long ownerId, long editedBy, long id)
        {
            Pipeline record = dbContext.Pipeline.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
            record.DeletedAt = DateTime.Now;
            record.EditedBy = editedBy;
            dbContext.SaveChanges();
        }
    }
}
