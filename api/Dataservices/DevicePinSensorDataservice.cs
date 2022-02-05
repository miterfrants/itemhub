using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class DevicePinSensorDataservice
    {
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
