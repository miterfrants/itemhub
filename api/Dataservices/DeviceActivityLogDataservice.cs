using System;
using System.Collections.Generic;
using System.Linq;

namespace Homo.IotApi
{
    public class DeviceActivityLogDataservice
    {
        public static int GetRowNumThis60Seconds(IotDbContext dbContext, long ownerId, long deviceId)
        {
            var determinOnlinLastDate = DateTime.Now.AddSeconds(-60);
            return dbContext.DeviceActivityLog.Where(x =>
                x.DeletedAt == null
                && x.DeviceId == deviceId
                && x.OwnerId == ownerId
                && determinOnlinLastDate <= x.CreatedAt
            ).Count();
        }

        public static int GetRowNum(IotDbContext dbContext, long ownerId, long deviceId)
        {
            return dbContext.DeviceActivityLog.Where(x =>
                x.DeletedAt == null
                && x.DeviceId == deviceId
                && x.OwnerId == ownerId
            ).Count();
        }

        public static List<DeviceActivityLog> GetLast(IotDbContext dbContext, long ownerId, List<long> deviceIds)
        {
            return dbContext.DeviceActivityLog.Where(x =>
                x.DeletedAt == null
                && deviceIds.Contains(x.DeviceId)
                && x.OwnerId == ownerId
            )
            .GroupBy(x => x.DeviceId)
            .Select(x => x.OrderBy(x => x.DeviceId)
                        .OrderByDescending(x => x.CreatedAt)
                        .FirstOrDefault())
            .ToList();
        }

        public static List<long> GetTooLongWithoutActivityDeviceIds(IotDbContext dbContext, int seconds) // 這個有效能低落的風險
        {
            var time = DateTime.Now.AddSeconds(-seconds);
            return dbContext.Device
            .Where(x => x.DeletedAt == null)
            .ToList()
            .GroupJoin(dbContext.DeviceActivityLog, x => x.Id, y => y.DeviceId, (device, activityLogs) => new
            {
                DeviceId = device.Id,
                ActivityLogs = activityLogs.Where(log => log.CreatedAt >= time).ToList()
            })
            .Where(x => x.ActivityLogs.Count() == 0)
            .Select(x => x.DeviceId).ToList();
        }

        public static DeviceActivityLog Create(IotDbContext dbContext, long ownerId, long deviceId)
        {
            DeviceActivityLog record = new DeviceActivityLog();
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            record.DeviceId = deviceId;
            dbContext.DeviceActivityLog.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static long? Delete(IotDbContext dbContext, DateTime endAt, int page, int limit, long? lastId)
        {
            List<DeviceActivityLog> items = dbContext.DeviceActivityLog
                .Where(x =>
                    x.CreatedAt <= endAt
                    && (lastId == null || x.Id < lastId)
                )
                .OrderByDescending(x => x.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToList();

            if (items.Count() == 0)
            {
                return null;
            }

            items.ForEach(item =>
            {
                dbContext.DeviceActivityLog.Remove(item);
            });
            DeviceActivityLog lastOne = items.LastOrDefault();
            long? currentLastId = lastOne == null ? null : lastOne.Id;
            dbContext.SaveChanges();
            return currentLastId;
        }
    }
}
