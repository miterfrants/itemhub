using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class DevicePinSwitchDataservice
    {
        public static DevicePinSwitch GetOne(IotDbContext dbContext, long? deviceId, byte? mode, string pin)
        {
            return dbContext.DevicePinSwitch
                .Where(x =>
                    x.DeletedAt == null &&
                    (deviceId == null || x.DeviceId == deviceId) &&
                    (mode == null || x.Mode == mode) &&
                    (pin == null || x.Pin == pin)
                )
                .FirstOrDefault();
        }
        public static List<DevicePinSwitch> GetAll(IotDbContext dbContext, long? ownerId, List<long> deviceIds, byte? mode, string pin)
        {
            return dbContext.DevicePinSwitch
                .Where(x =>
                    x.DeletedAt == null &&
                    (ownerId == null || x.OwnerId == ownerId) &&
                    (deviceIds == null || deviceIds.Contains(x.DeviceId)) &&
                    (mode == null || x.Mode == (byte)mode) &&
                    (pin == null || x.Pin == pin)
                )
                .ToList<DevicePinSwitch>();
        }

        public static DevicePinSwitch Create(IotDbContext dbContext, long ownerId, long deviceId, DTOs.DevicePinSwitch dto)
        {
            DevicePinSwitch record = new DevicePinSwitch();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            record.DeviceId = deviceId;
            dbContext.DevicePinSwitch.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(IotDbContext dbContext, long ownerId, List<long> ids)
        {
            foreach (long id in ids)
            {
                DevicePinSwitch record = new DevicePinSwitch { Id = id, OwnerId = ownerId };
                dbContext.Attach<DevicePinSwitch>(record);
                record.DeletedAt = DateTime.Now;
            }
            dbContext.SaveChanges();
        }

        public static void Update(IotDbContext dbContext, long ownerId, long id, DTOs.DevicePinSwitch dto)
        {
            DevicePinSwitch record = dbContext.DevicePinSwitch.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.EditedAt = DateTime.Now;
            dbContext.SaveChanges();
        }
        public static void UpdateValueByDeviceId(IotDbContext dbContext, long ownerId, long deviceId, string pin, decimal value)
        {
            DevicePinSwitch record = dbContext.DevicePinSwitch.Where(x =>
                x.DeviceId == deviceId
                && x.OwnerId == ownerId
                && x.Pin == pin
                && x.Mode == (byte)DEVICE_MODE.SWITCH
            ).FirstOrDefault();
            record.Value = value;
            record.EditedAt = DateTime.Now;
            dbContext.SaveChanges();
        }

        public static void Delete(IotDbContext dbContext, long ownerId, long id)
        {
            DevicePinSwitch record = dbContext.DevicePinSwitch.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
            record.DeletedAt = DateTime.Now;
            dbContext.SaveChanges();
        }

    }
}
