using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class PipelineExecuteLogDataservice
    {
        public static PipelineExecuteLog Create(IotDbContext dbContext, long ownerId, DTOs.PipelineExecuteLog dto)
        {
            PipelineExecuteLog record = new PipelineExecuteLog();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            dbContext.PipelineExecuteLog.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static List<PipelineExecuteLog> GetList(IotDbContext dbContext, long ownerId, long pipelineId, bool? isHead, DateTime? startAt, DateTime? endAt)
        {
            return dbContext.PipelineExecuteLog.Include(x => x.Item).Where(x =>
                x.DeletedAt == null
                && x.PipelineId == pipelineId
                && x.OwnerId == ownerId
                && (isHead == null || x.IsHead == isHead)
                && (startAt == null || x.CreatedAt >= startAt)
                && (endAt == null || x.CreatedAt <= endAt)
            ).ToList();
        }

        public static int GetCount(IotDbContext dbContext, long ownerId, long pipelineId, long? itemId, DateTime? startAt, DateTime? endAt)
        {
            return dbContext.PipelineExecuteLog.Where(x =>
                x.DeletedAt == null
                && x.PipelineId == pipelineId
                && x.OwnerId == ownerId
                && (itemId == null || x.ItemId == itemId)
                && (startAt == null || x.CreatedAt >= startAt)
                && (endAt == null || x.CreatedAt <= endAt)
            ).Count();
        }

        public static List<PipelineExecuteLog> GetLastItems(IotDbContext dbContext, long ownerId, List<long> pipelineIds)
        {
            return dbContext.PipelineExecuteLog.Where(x =>
                x.DeletedAt == null
                && pipelineIds.Contains(x.PipelineId)
                && x.OwnerId == ownerId
            ).Include(x => x.Item).GroupBy(x => x.PipelineId).Select(g => g.OrderByDescending(x => x.CreatedAt).FirstOrDefault()).ToList();
        }
    }
}
