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

        public static List<SensorLog> GetList(IotDbContext dbContext, long? ownerId, List<long> deviceIds, string pin, int page = 1, int limit = 50, DateTime? startAt = null, DateTime? endAt = null)
        {
            return dbContext.SensorLog
                .Where(x =>
                    x.DeletedAt == null &&
                    (startAt == null || x.CreatedAt >= startAt) &&
                    (endAt == null || x.CreatedAt <= endAt) &&
                    (ownerId == null || x.OwnerId == ownerId) &&
                    (deviceIds == null || deviceIds.Contains(x.DeviceId)) &&
                    (pin == null || x.Pin == pin)
                )
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToList<SensorLog>();
        }

        public static decimal? GetAggregateValue(IotDbContext dbContext, long? ownerId, long deviceId, string pin, PIPELINE_DEVICE_STATISTICAL_METHODS aggregateType, int? page, int? limit, DateTime? startAt = null, DateTime? endAt = null)
        {
            var query = dbContext.SensorLog
                .Where(x =>
                    x.DeletedAt == null &&
                    (x.OwnerId == ownerId) &&
                    (deviceId == x.DeviceId) &&
                    (x.Pin == pin) &&
                    (startAt == null || x.CreatedAt >= startAt.GetValueOrDefault()) &&
                    (endAt == null || x.CreatedAt <= endAt.GetValueOrDefault())
                )
                .OrderByDescending(x => x.CreatedAt);



            if (page != null && limit != null)
            {
                query = (IOrderedQueryable<SensorLog>)query.Skip((page.GetValueOrDefault() - 1) & limit.GetValueOrDefault()).Take(limit.GetValueOrDefault());
            }


            decimal? result = null;
            try
            {
                if (aggregateType == PIPELINE_DEVICE_STATISTICAL_METHODS.MAX)
                {
                    result = query.GroupBy(x => new { x.OwnerId, x.DeviceId, x.Pin }).Select(g => g.Max(x => x.Value)).FirstOrDefault();
                }
                else if (aggregateType == PIPELINE_DEVICE_STATISTICAL_METHODS.MIN)
                {
                    result = query.GroupBy(x => new { x.OwnerId, x.DeviceId, x.Pin }).Select(g => g.Min(x => x.Value)).FirstOrDefault();
                }
                else if (aggregateType == PIPELINE_DEVICE_STATISTICAL_METHODS.AVG)
                {
                    result = query.GroupBy(x => new { x.OwnerId, x.DeviceId, x.Pin }).Select(g => g.Average(x => x.Value)).FirstOrDefault();
                }
                else if (aggregateType == PIPELINE_DEVICE_STATISTICAL_METHODS.SUM)
                {
                    result = query.GroupBy(x => new { x.OwnerId, x.DeviceId, x.Pin }).Select(g => g.Sum(x => x.Value)).FirstOrDefault();
                }
                else if (aggregateType == PIPELINE_DEVICE_STATISTICAL_METHODS.MID)
                {
                    var tempResult = query.Select(x => x.Value).ToList().OrderBy(x => x).ToList();
                    result = tempResult[tempResult.Count / 2];
                }
                else if (aggregateType == PIPELINE_DEVICE_STATISTICAL_METHODS.STD)
                {
                    var data = query.Select(x => (decimal)x.Value).ToList();
                    var avg = data.Average();
                    decimal sumOfSquaresOfDifferences = data.Select(val => (val - avg) * (val - avg)).Sum();
                    decimal sd = (decimal)Math.Sqrt((double)(sumOfSquaresOfDifferences / data.Count));
                    result = sd;
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"{Newtonsoft.Json.JsonConvert.SerializeObject(ex, Newtonsoft.Json.Formatting.Indented)}");
                return null;
            }
            return result;
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

        public static decimal GetMAX(IotDbContext dbContext, long ownerId, List<long> ids, string pin, DateTime? startAt, DateTime? endAt)
        {
            return dbContext.SensorLog.Where(x => x.DeletedAt == null
                && x.OwnerId == ownerId
                && ids.Contains(x.DeviceId)
                && x.Pin == pin
                && (startAt == null || x.CreatedAt >= startAt.GetValueOrDefault())
                && (endAt == null || x.CreatedAt <= endAt.GetValueOrDefault())
            ).Max(x => x.Value).GetValueOrDefault(0);
        }

        public static decimal GetMIN(IotDbContext dbContext, long ownerId, List<long> ids, string pin, DateTime? startAt, DateTime? endAt)
        {
            return dbContext.SensorLog.Where(x => x.DeletedAt == null
                && x.OwnerId == ownerId
                && ids.Contains(x.DeviceId)
                && x.Pin == pin
                && (startAt == null || x.CreatedAt >= startAt.GetValueOrDefault())
                && (endAt == null || x.CreatedAt <= endAt.GetValueOrDefault())
            ).Min(x => x.Value).GetValueOrDefault(0);
        }


        public static decimal GetSUM(IotDbContext dbContext, long ownerId, List<long> ids, string pin, DateTime? startAt, DateTime? endAt)
        {
            return dbContext.SensorLog.Where(x => x.DeletedAt == null
                && x.OwnerId == ownerId
                && ids.Contains(x.DeviceId)
                && x.Pin == pin
                && (startAt == null || x.CreatedAt >= startAt.GetValueOrDefault())
                && (endAt == null || x.CreatedAt <= endAt.GetValueOrDefault())
            ).Sum(x => x.Value.GetValueOrDefault(0));
        }

        public static decimal GetAVG(IotDbContext dbContext, long ownerId, List<long> ids, string pin, DateTime? startAt, DateTime? endAt)
        {
            return dbContext.SensorLog.Where(x => x.DeletedAt == null
                && x.OwnerId == ownerId
                && ids.Contains(x.DeviceId)
                && x.Pin == pin
                && (startAt == null || x.CreatedAt >= startAt.GetValueOrDefault())
                && (endAt == null || x.CreatedAt <= endAt.GetValueOrDefault())
            ).Average(x => x.Value.GetValueOrDefault(0));
        }

        public static decimal GetSTD(IotDbContext dbContext, long ownerId, List<long> ids, string pin, DateTime? startAt, DateTime? endAt)
        {
            var data = dbContext.SensorLog
            .Where(x => x.DeletedAt == null
                && x.OwnerId == ownerId
                && ids.Contains(x.DeviceId)
                && x.Pin == pin
                && (startAt == null || x.CreatedAt >= startAt.GetValueOrDefault())
                && (endAt == null || x.CreatedAt <= endAt.GetValueOrDefault())).Select(x => (decimal)x.Value).ToList();
            var avg = data.Average();
            decimal sumOfSquaresOfDifferences = data.Select(val => (val - avg) * (val - avg)).Sum();
            decimal sd = (decimal)Math.Sqrt((double)(sumOfSquaresOfDifferences / data.Count));
            return sd;
        }

        public static decimal GetMID(IotDbContext dbContext, long ownerId, List<long> ids, string pin, DateTime? startAt, DateTime? endAt)
        {

            var tempResult = dbContext.SensorLog
            .Where(x => x.DeletedAt == null
                && x.OwnerId == ownerId
                && ids.Contains(x.DeviceId)
                && x.Pin == pin
                && (startAt == null || x.CreatedAt >= startAt.GetValueOrDefault())
                && (endAt == null || x.CreatedAt <= endAt.GetValueOrDefault()))
            .Select(x => x.Value.GetValueOrDefault(0)).ToList().OrderBy(x => x).ToList();
            var result = tempResult[tempResult.Count / 2];

            return result;
        }
    }
}
