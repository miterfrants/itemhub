using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class SensorLogDataservice
    {

        public static long? DeleteExpiredDataAndGetLatestItemId(IotDbContext dbContext, int page = 1, int limit = 50, long? latestItemId = null)
        {
            List<SensorLog> data = dbContext.SensorLog
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
                SavingSeconds = SubscriptionHelper.GetStorageSavingSeconds(x == null || x.PricingPlan == null ? null : (PRICING_PLAN)x.PricingPlan)
            })
            .Where(x => x.CreatedAt.AddSeconds(x.SavingSeconds) < DateTime.Now)
            .Select(x => x.Id)
            .ToList<long>();

            dbContext.SensorLog.Where(x => shouldBeDeletedIds.Contains(x.Id)).DeleteFromQuery();
            dbContext.SaveChanges();


            return latestId;
        }

        public static List<SensorLog> GetList(IotDbContext dbContext, long? ownerId, List<long> deviceIds, string pin, int page = 1, int limit = 50)
        {
            return dbContext.SensorLog
                .Where(x =>
                    x.DeletedAt == null &&
                    (ownerId == null || x.OwnerId == ownerId) &&
                    (deviceIds == null || deviceIds.Contains(x.DeviceId)) &&
                    (pin == null || x.Pin == pin)
                )
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToList<SensorLog>();
        }

        public static decimal? GetAggregateValue(IotDbContext dbContext, long? ownerId, long deviceId, string pin, PIPELINE_DEVICE_STATIC_METHODS aggregateType, int page = 1, int limit = 50)
        {
            var query = dbContext.SensorLog
                .Where(x =>
                    x.DeletedAt == null &&
                    (x.OwnerId == ownerId) &&
                    (deviceId == x.DeviceId) &&
                    (x.Pin == pin)
                )
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit);
            if (aggregateType == PIPELINE_DEVICE_STATIC_METHODS.MAX)
            {
                return query.GroupBy(x => new { x.OwnerId, x.DeviceId, x.Pin }).Select(g => g.Max(x => x.Value)).FirstOrDefault();
            }
            else if (aggregateType == PIPELINE_DEVICE_STATIC_METHODS.MIN)
            {
                return query.GroupBy(x => new { x.OwnerId, x.DeviceId, x.Pin }).Select(g => g.Min(x => x.Value)).FirstOrDefault();
            }
            else if (aggregateType == PIPELINE_DEVICE_STATIC_METHODS.AVG)
            {
                return query.GroupBy(x => new { x.OwnerId, x.DeviceId, x.Pin }).Select(g => g.Average(x => x.Value)).FirstOrDefault();
            }
            else if (aggregateType == PIPELINE_DEVICE_STATIC_METHODS.SUM)
            {
                return query.GroupBy(x => new { x.OwnerId, x.DeviceId, x.Pin }).Select(g => g.Sum(x => x.Value)).FirstOrDefault();
            }
            else if (aggregateType == PIPELINE_DEVICE_STATIC_METHODS.MID)
            {
                var result = query.Select(x => x.Value).ToList().OrderBy(x => x).ToList();
                return result[result.Count / 2];
            }
            else if (aggregateType == PIPELINE_DEVICE_STATIC_METHODS.STD)
            {
                var data = query.Select(x => (decimal)x.Value).ToList();
                var avg = data.Average();
                decimal sumOfSquaresOfDifferences = data.Select(val => (val - avg) * (val - avg)).Sum();
                decimal sd = (decimal)Math.Sqrt((double)(sumOfSquaresOfDifferences / data.Count));
                return sd;
            }
            return null;

        }


        public static SensorLog Create(IotDbContext dbContext, long ownerId, long deviceId, string pin, DTOs.CreateSensorLog dto)
        {
            SensorLog record = new SensorLog();
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
            dbContext.SensorLog.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(IotDbContext dbContext, long ownerId, List<long> ids)
        {
            foreach (long id in ids)
            {
                SensorLog record = new SensorLog { Id = id, OwnerId = ownerId };
                dbContext.Attach<SensorLog>(record);
                record.DeletedAt = DateTime.Now;
            }
            dbContext.SaveChanges();
        }
    }
}
