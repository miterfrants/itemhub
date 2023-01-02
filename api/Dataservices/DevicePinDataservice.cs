using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System;

namespace Homo.IotApi
{
    public class DevicePinDataservice
    {
        public static List<DTOs.DevicePin> GetAll(IotDbContext dbContext, long ownerId, List<long> deviceIds, DEVICE_MODE? mode, string pin)
        {
            return _GetQueryableDevicePins(dbContext, null, ownerId, deviceIds, mode, pin)
                .Select(x => new DTOs.DevicePin()
                {
                    Id = x.Pin.Id,
                    CreatedAt = x.Pin.Mode == DEVICE_MODE.SWITCH ? x.Pin.CreatedAt :
                        x.LastLog != null ? x.LastLog.CreatedAt : null,
                    EditedAt = x.Pin.EditedAt,
                    OwnerId = x.Pin.OwnerId,
                    DeletedAt = x.Pin.DeletedAt,
                    Pin = x.Pin.Pin,
                    PinNumber = x.Pin.PinNumber,
                    Mode = x.Pin.Mode,
                    Name = x.Pin.Name,
                    Value = x.Pin.Mode == DEVICE_MODE.SWITCH ? x.Pin.Value :
                        x.LastLog != null ? x.LastLog.Value : null,
                    DeviceId = x.Pin.DeviceId,
                    Device = x.Pin.Device,
                })
                .ToList();
        }

        public static List<DTOs.DevicePinSummary> GetAllSummary(IotDbContext dbContext, long ownerId, List<long> deviceIds, DEVICE_MODE? mode, string pin)
        {
            return _GetQueryableDevicePins(dbContext, null, ownerId, deviceIds, mode, pin)
                .Select(x =>
                {
                    var value = x.Pin.Mode == DEVICE_MODE.SWITCH ? x.Pin.Value.ToString("N0") :
                        x.LastLog != null ? x.LastLog.Value.ToString() : null;
                    int finalValue = -1;
                    Int32.TryParse(value, out finalValue);
                    return new DTOs.DevicePinSummary()
                    {
                        Id = x.Pin.Id,
                        Pin = x.Pin.Pin,
                        Value = finalValue == -1 ? 0 : finalValue
                    };
                }).ToList();
        }

        public static DevicePin Create(IotDbContext dbContext, long ownerId, long deviceId, DTOs.DevicePin dto)
        {
            DevicePin record = new DevicePin();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            record.DeviceId = deviceId;
            dbContext.DevicePin.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static List<DevicePin> BatchedCreate(IotDbContext dbContext, long deviceId, long ownerId, List<DTOs.DevicePinsData> listOfDto)
        {
            List<DevicePin> result = new List<DevicePin>();
            listOfDto.ForEach(dto =>
            {
                DevicePin record = new DevicePin();
                foreach (var propOfDTO in dto.GetType().GetProperties())
                {
                    var value = propOfDTO.GetValue(dto);
                    var prop = record.GetType().GetProperty(propOfDTO.Name);
                    prop.SetValue(record, value);
                }
                record.CreatedAt = DateTime.Now;
                record.OwnerId = ownerId;
                record.DeviceId = deviceId;
                dbContext.DevicePin.Add(record);
                result.Add(record);
            });
            dbContext.SaveChanges();
            return result;
        }

        public static void BatchedUpdate(IotDbContext dbContext, long deviceId, long ownerId, List<DTOs.DevicePinsData> dto)
        {
            dto.ForEach(item =>
            {
                dbContext.DevicePin.Where(x =>
                    x.DeviceId == deviceId
                    && x.OwnerId == ownerId
                    && x.Pin == item.Pin
                ).UpdateFromQuery(x => new DevicePin()
                {
                    Name = item.Name,
                    Value = item.Value,
                    Mode = item.Mode,
                    EditedBy = ownerId,
                    EditedAt = DateTime.Now
                });
            });
        }

        public static DevicePin GetOne(IotDbContext dbContext, long ownerId, long deviceId, DEVICE_MODE? mode, string pin)
        {
            return dbContext.DevicePin
                .Include(x => x.Device)
                .Where(x =>
                    x.DeletedAt == null
                    && x.DeviceId == deviceId
                    && x.OwnerId == ownerId // 前三項東西都要傳避免有人忘了做檢查
                    && (mode == null || x.Mode == mode)
                    && (pin == null || x.Pin == pin)
                ).FirstOrDefault();
        }

        // temp 
        public static DevicePin GetOneByDeviceIdAndPin(IotDbContext dbContext, long ownerId, long deviceId, DEVICE_MODE? mode, string pin)
        {
            return dbContext.DevicePin
                .Include(x => x.Device)
                .Where(x =>
                    x.DeletedAt == null
                    && x.DeviceId == deviceId
                    && x.OwnerId == ownerId // 前三項東西都要傳避免有人忘了做檢查
                    && (mode == null || x.Mode == mode)
                    && (pin == null || x.Pin == pin)
                ).FirstOrDefault();
        }

        public static void RemoveUnusePins(IotDbContext dbContext, long ownerId, long deviceId, List<string> unusedPins)
        {
            dbContext.DevicePin.Where(x =>
                x.OwnerId == ownerId
                && x.DeviceId == deviceId
                && unusedPins.Contains(x.Pin))
            .UpdateFromQuery(x => new DevicePin()
            {
                EditedBy = ownerId,
                DeletedAt = DateTime.Now
            });
        }

        public static void UpdatePinName(IotDbContext dbContext, long ownerId, long deviceId, string pin, string name)
        {
            dbContext.DevicePin.Where(x =>
                x.OwnerId == ownerId
                && x.DeviceId == deviceId
                && x.Pin == pin
            ).UpdateFromQuery(x => new DevicePin()
            {
                Name = name,
                EditedAt = DateTime.Now
            });
        }

        public static void UpdateValueByDeviceId(IotDbContext dbContext, long ownerId, long deviceId, string pin, decimal value)
        {
            dbContext.DevicePin.Where(x =>
                x.DeviceId == deviceId
                && x.OwnerId == ownerId
                && x.Pin == pin
                && x.Mode == DEVICE_MODE.SWITCH
            ).UpdateFromQuery(x => new DevicePin()
            {
                Value = value,
                EditedAt = DateTime.Now
            });
        }


        private static IEnumerable<dynamic> _GetQueryableDevicePins(IotDbContext dbContext, long? id, long ownerId, List<long> deviceIds, DEVICE_MODE? mode, string pin)
        {
            return dbContext.DevicePin.Where(x =>
                x.DeletedAt == null
                && (id == null || x.Id == id)
                && (deviceIds == null || deviceIds.Contains(x.DeviceId))
                && x.OwnerId == ownerId
                && (mode == null || x.Mode == mode)
                && (pin == null || x.Pin == pin)
            )
            .Join(dbContext.Device, pin => pin.DeviceId, device => device.Id, (pin, device) => new DevicePin()
            {
                Id = pin.Id,
                CreatedAt = pin.CreatedAt,
                EditedAt = pin.EditedAt,
                OwnerId = pin.OwnerId,
                DeletedAt = pin.DeletedAt,
                Pin = pin.Pin,
                PinNumber = pin.PinNumber,
                Mode = pin.Mode,
                Name = pin.Name,
                Value = pin.Value,
                DeviceId = pin.DeviceId,
                Device = device
            })
            .ToList().GroupJoin(
                dbContext.SensorLog,
                pin => new { pin.DeviceId, pin.OwnerId, pin.Pin },
                log => new { log.DeviceId, log.OwnerId, log.Pin },
                (pin, logs) => new { Pin = pin, LastLog = logs.OrderByDescending(x => x.Id).FirstOrDefault() }
            );
        }

        public partial class DevicePinRaw
        {
            public DevicePin Pin { get; set; }
            public SensorLog LastLog { get; set; }
        }
    }
}
