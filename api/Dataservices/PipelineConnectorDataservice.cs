using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class PipelineConnectorDataservice
    {
        public static List<PipelineConnector> GetAll(IotDbContext dbContext, long ownerId, long pipelineId, string title)
        {
            return dbContext.PipelineConnector
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && x.PipelineId == pipelineId
                )
                .ToList();
        }

        public static int GetRowNums(IotDbContext dbContext, long ownerId, long pipelineId, long? sourcePipelineItemId, long? destPipelineItemId)
        {
            return dbContext.PipelineConnector
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && x.PipelineId == pipelineId
                    && (sourcePipelineItemId == null || x.SourcePipelineItemId == sourcePipelineItemId)
                    && (destPipelineItemId == null || x.DestPipelineItemId == destPipelineItemId)
                )
                .Count();
        }

        public static PipelineConnector GetOne(IotDbContext dbContext, long ownerId, long pipelineId, long id)
        {
            return dbContext.PipelineConnector.FirstOrDefault(x =>
                x.DeletedAt == null
                && x.Id == id
                && x.PipelineId == pipelineId
                && x.OwnerId == ownerId
            );
        }

        public static PipelineConnector Create(IotDbContext dbContext, long ownerId, DTOs.PipelineConnector dto)
        {
            PipelineConnector record = new PipelineConnector();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            dbContext.PipelineConnector.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(IotDbContext dbContext, long ownerId, long editedBy, long pipelineId, List<long> ids)
        {
            foreach (long id in ids)
            {
                PipelineConnector record = new PipelineConnector { Id = id, OwnerId = ownerId };
                dbContext.Attach<PipelineConnector>(record);
                record.DeletedAt = DateTime.Now;
                record.EditedBy = editedBy;
            }
            dbContext.SaveChanges();
        }

        public static void Update(IotDbContext dbContext, long ownerId, long editedBy, long pipelineId, long id, DTOs.PipelineConnector dto)
        {
            PipelineConnector record = dbContext.PipelineConnector.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
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
            PipelineConnector record = dbContext.PipelineConnector.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
            record.DeletedAt = DateTime.Now;
            record.EditedBy = editedBy;
            dbContext.SaveChanges();
        }
    }
}
