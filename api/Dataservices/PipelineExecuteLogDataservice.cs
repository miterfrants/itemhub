using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class PipelineExecuteLogDataservice
    {
        public static long? DeleteExpiredDataAndGetLatestItemId(IotDbContext dbContext, int page = 1, int limit = 50, long? latestItemId = null)
        {
            List<PipelineExecuteLog> data = dbContext.PipelineExecuteLog
                .Where(x =>
                    x.DeletedAt == null
                    && (latestItemId == null || x.Id < latestItemId)
                    && (x.CreatedAt.AddSeconds(24 * 60 * 60) < DateTime.Now)
                )
                .OrderByDescending(x => x.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToList();

            long? latestId = data.LastOrDefault()?.Id;

            if (data == null)
            {
                return null;
            }

            List<long> shouldBeDeletedIds = data.GroupJoin(dbContext.Subscription, x => x.OwnerId, y => y.OwnerId, (x, y) => new
            {
                x.Id,
                x.CreatedAt,
            })
            .Select(x => new
            {
                x.Id,
                x.CreatedAt,
                SavingSeconds = 24 * 60 * 60
            })
            .Where(x => x.CreatedAt.AddSeconds(x.SavingSeconds) < DateTime.Now)
            .Select(x => x.Id)
            .ToList<long>();

            dbContext.PipelineExecuteLog.Where(x => shouldBeDeletedIds.Contains(x.Id)).DeleteFromQuery();
            dbContext.SaveChanges();


            return latestId;
        }

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

        public static List<PipelineExecuteLog> GetList(IotDbContext dbContext, long ownerId, long pipelineId, bool? isHead, DateTime? startAt, DateTime? endAt, int? page = null, int? limit = null)
        {
            IQueryable<PipelineExecuteLog> orderedPipelineExecuteLog = dbContext.PipelineExecuteLog.Include(x => x.Item).Where(x =>
                x.DeletedAt == null
                && x.PipelineId == pipelineId
                && x.OwnerId == ownerId
                && (isHead == null || x.IsHead == isHead)
                && (startAt == null || x.CreatedAt >= startAt)
                && (endAt == null || x.CreatedAt <= endAt)
            )
            .OrderByDescending(x => x.Id);
            if (page != null && limit != null)
            {
                orderedPipelineExecuteLog = orderedPipelineExecuteLog.Skip((page.GetValueOrDefault() - 1) * limit.GetValueOrDefault()).Take(limit.GetValueOrDefault());
            }
            return orderedPipelineExecuteLog.ToList();
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
            var lastItemIds = dbContext.PipelineExecuteLog.Where(x =>
                x.DeletedAt == null
                && pipelineIds.Contains(x.PipelineId)
                && x.OwnerId == ownerId
            ).GroupBy(x => x.PipelineId).Select(g => g.OrderByDescending(x => x.CreatedAt).FirstOrDefault()).ToList().Select(x => x.Id);
            return dbContext.PipelineExecuteLog.Include(x => x.Item).Where(x => lastItemIds.Contains(x.Id)).ToList();
        }
    }
}
