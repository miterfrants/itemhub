using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class PipelineItemDataservice
    {
        public static List<PipelineItem> GetAll(IotDbContext dbContext, long ownerId, long pipelineId, string title)
        {
            return dbContext.PipelineItem
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && x.PipelineId == pipelineId
                )
                .ToList();
        }

        public static int GetRowNums(IotDbContext dbContext, long ownerId, long pipelineId)
        {
            return dbContext.PipelineItem
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && x.PipelineId == pipelineId
                )
                .Count();
        }

        public static PipelineItem GetOne(IotDbContext dbContext, long ownerId, long pipelineId, long id)
        {
            return dbContext.PipelineItem.FirstOrDefault(x =>
                x.DeletedAt == null
                && x.Id == id
                && x.PipelineId == pipelineId
                && x.OwnerId == ownerId
            );
        }

        public static PipelineItem Create(IotDbContext dbContext, long ownerId, DTOs.PipelineItem dto)
        {
            PipelineItem record = new PipelineItem();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            dbContext.PipelineItem.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(IotDbContext dbContext, long ownerId, long editedBy, long pipelineId, List<long> ids)
        {
            foreach (long id in ids)
            {
                PipelineItem record = new PipelineItem { Id = id, OwnerId = ownerId };
                dbContext.Attach<PipelineItem>(record);
                record.DeletedAt = DateTime.Now;
                record.EditedBy = editedBy;
            }
            dbContext.SaveChanges();
        }

        public static void Update(IotDbContext dbContext, long ownerId, long editedBy, long pipelineId, long id, DTOs.PipelineItem dto)
        {
            PipelineItem record = dbContext.PipelineItem.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
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

        public static void Delete(IotDbContext dbContext, long ownerId, long editedBy, long pipelineId, long id)
        {
            PipelineItem record = dbContext.PipelineItem.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
            record.DeletedAt = DateTime.Now;
            record.EditedBy = editedBy;
            dbContext.SaveChanges();
        }
    }
}
