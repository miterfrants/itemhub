using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class DevicePinSensorDataservice
    {

        public static long? DeleteExpiredDataAndGetLatestItemId(IotDbContext dbContext, int page = 1, int limit = 50, long? latestItemId = null)
        {
            List<DevicePinSensor> data = dbContext.DevicePinSensor
                .Where(x =>
                    x.DeletedAt == null
                    && (latestItemId == null || x.Id < latestItemId)
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
                PricingPlan = y.Where(item => item.DeletedAt == null).OrderByDescending(item => item.CreatedAt).FirstOrDefault()?.PricingPlan
            })
            .Select(x => new
            {
                x.Id,
                x.CreatedAt,
                SavingSeconds = SubscriptionHelper.GetStorageSavingSeconds(x == null ? null : (PRICING_PLAN)x.PricingPlan)
            })
            .Where(x => x.CreatedAt.AddSeconds(x.SavingSeconds) < DateTime.Now)
            .Select(x => x.Id)
            .ToList<long>();

            dbContext.DevicePinSensor.Where(x => shouldBeDeletedIds.Contains(x.Id)).DeleteFromQuery();
            dbContext.SaveChanges();


            return latestId;
        }

        public static List<DevicePinSensor> GetList(IotDbContext dbContext, long? ownerId, List<long> deviceIds, byte? mode, string pin, int page = 1, int limit = 50)
        {
            return dbContext.DevicePinSensor
                .Where(x =>
                    x.DeletedAt == null &&
                    (ownerId == null || x.OwnerId == ownerId) &&
                    (deviceIds == null || deviceIds.Contains(x.DeviceId)) &&
                    (mode == null || x.Mode == (byte)mode) &&
                    (pin == null || x.Pin == pin)
                )
                .OrderByDescending(x => x.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToList<DevicePinSensor>();
        }

        public static DevicePinSensor Create(IotDbContext dbContext, long ownerId, long deviceId, string pin, DTOs.DevicePinSensor dto)
        {
            DevicePinSensor record = new DevicePinSensor();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            record.DeviceId = deviceId;
            record.Pin = pin;
            dbContext.DevicePinSensor.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(IotDbContext dbContext, long ownerId, List<long> ids)
        {
            foreach (long id in ids)
            {
                DevicePinSensor record = new DevicePinSensor { Id = id, OwnerId = ownerId };
                dbContext.Attach<DevicePinSensor>(record);
                record.DeletedAt = DateTime.Now;
            }
            dbContext.SaveChanges();
        }
    }
}
