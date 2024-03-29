using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class LogDataservice
    {
        public static long? DeleteExpiredDataAndGetLatestItemId(IotDbContext dbContext, int page = 1, int limit = 50, long? latestItemId = null)
        {
            List<Log> data = dbContext.Log
                .Where(x =>
                    (latestItemId == null || x.Id < latestItemId)
                    && (x.CreatedAt.AddSeconds(3 * 24 * 60 * 60) < DateTime.Now)
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

            List<long> shouldBeDeletedIds = data.Select(x => x.Id).ToList();
            dbContext.Log.Where(x => shouldBeDeletedIds.Contains(x.Id)).DeleteFromQuery();
            dbContext.SaveChanges();
            return latestId;
        }
        public static Log Create(IotDbContext dbContext, DTOs.Log dto, LOG_TYPE logType = LOG_TYPE.COMMON)
        {
            Log record = new Log();

            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            record.LogType = logType;
            dbContext.Log.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static List<Log> GetList(IotDbContext dbContext, long ownerId, long pipelineId, int page, int limit)
        {
            return dbContext.Log.Where(x =>
                x.UserId == ownerId
                && x.PipelineId == pipelineId
            )
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToList();
        }

        public static int GetRowNum(IotDbContext dbContext, long ownerId, long pipelineId)
        {
            return dbContext.Log.Where(x =>
                x.UserId == ownerId
                && x.PipelineId == pipelineId
            )
            .Count();
        }
    }
}
