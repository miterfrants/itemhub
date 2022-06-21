using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class TriggerLogDataservice
    {
        public static TriggerLog Create(IotDbContext dbContext, long triggerId, string raw)
        {
            TriggerLog record = new TriggerLog();
            record.CreatedAt = DateTime.Now;
            record.TriggerId = triggerId;
            record.Raw = raw;
            dbContext.TriggerLog.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchedCreate(IotDbContext dbContext, List<Trigger> list)
        {
            list.ForEach(item =>
            {
                TriggerLog record = new TriggerLog();
                record.CreatedAt = DateTime.Now;
                record.TriggerId = item.Id;
                record.Type = item.Type;
                record.OwnerId = item.OwnerId;
                record.Raw = Newtonsoft.Json.JsonConvert.SerializeObject(item);
                dbContext.TriggerLog.Add(record);
            });
            dbContext.SaveChanges();
        }

        public static int GetCountOfNotificationInPeriod(IotDbContext dbContext, DateTime startAt, DateTime endAt, long ownerId, TRIGGER_TYPE? triggerType)
        {
            return dbContext.TriggerLog.Where(x =>
                x.CreatedAt >= startAt &&
                x.CreatedAt <= endAt &&
                x.OwnerId == ownerId &&
                (triggerType == null || x.Type == triggerType.GetValueOrDefault())).Count();
        }

        public static TriggerLog GetLastOne(IotDbContext dbContext, long triggerId, long ownerId, TRIGGER_TYPE triggerType)
        {
            return dbContext.TriggerLog.Where(x =>
                x.OwnerId == ownerId &&
                x.Type == triggerType &&
                x.TriggerId == triggerId
            ).OrderByDescending(x => x.Id).Take(1).FirstOrDefault();
        }

        public static void Delete(IotDbContext dbContext, DateTime endAt, TRIGGER_TYPE? triggerType)
        {
            dbContext.TriggerLog.Where(x => x.CreatedAt <= endAt && (
                triggerType == null || x.Type == triggerType.GetValueOrDefault()
            )).DeleteFromQuery();
        }

    }
}