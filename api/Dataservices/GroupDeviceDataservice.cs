using System.Collections.Generic;
using System;
using System.Linq;

namespace Homo.IotApi
{
    public class GroupDeviceDataservice
    {
        public static List<Device> GetList(IotDbContext dbContext, long userId, long groupId, string name, int page, int limit)
        {
            return dbContext.GroupDevice
                .Where(x =>
                    x.DeletedAt == null
                    && x.UserId == userId
                    && x.GroupId == groupId

                )
                .Join(dbContext.Device, groupDevice => groupDevice.DeviceId, device => device.Id, (groupDevice, device) =>
                new
                {
                    groupDevice = groupDevice,
                    device = device
                })
                .Where(x =>
                    x.device.DeletedAt == null
                    && (name == null || x.device.Name.Contains(name))
                )
                .OrderByDescending(x => x.groupDevice.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(x => x.device)
                .ToList();
        }
        public static int GetRowNums(IotDbContext dbContext, long userId, long groupId, string name)
        {
            return dbContext.GroupDevice
                .Where(x =>
                    x.DeletedAt == null
                    && x.UserId == userId
                    && x.GroupId == groupId
                )
                .Join(dbContext.Device, groupDevice => groupDevice.DeviceId, device => device.Id, (groupDevice, device) =>
                new
                {
                    groupDevice = groupDevice,
                    device = device
                })
                .Where(x =>
                    x.device.DeletedAt == null
                    && (name == null || x.device.Name.Contains(name))
                )
                .Count();
        }

        public static GroupDevice GetOne(IotDbContext dbContext, long groupId, long deviceId)
        {
            return dbContext.GroupDevice
                .Where(x => x.DeletedAt == null
                    && x.DeviceId == deviceId
                    && x.GroupId == groupId
                )
                .FirstOrDefault();
        }

        public static List<ViewGroupDevice> GetAll(IotDbContext dbContext, long userId, long groupId, List<long> deviceIds)
        {
            return dbContext.GroupDevice
                .Where(x =>
                    x.DeletedAt == null
                    && x.UserId == userId
                    && x.GroupId == groupId
                    && (deviceIds == null || deviceIds.Contains(x.DeviceId))
                )
                .Join(dbContext.Device, groupDevice => groupDevice.DeviceId, device => device.Id, (groupDevice, device) =>
                new
                {
                    groupDevice = groupDevice,
                    device = device
                })
                .OrderByDescending(x => x.groupDevice.Id)
                .Select(x => new ViewGroupDevice()
                {
                    Id = x.groupDevice.Id,
                    CreatedAt = x.groupDevice.CreatedAt,
                    EditedAt = x.groupDevice.EditedAt,
                    DeletedAt = x.groupDevice.DeletedAt,
                    DeviceId = x.groupDevice.DeviceId,
                    GroupId = x.groupDevice.GroupId,
                    UserId = x.groupDevice.UserId,
                    DeviceName = x.device.Name
                })
                .ToList();
        }

        public static List<GroupDevice> BatchCreate(IotDbContext dbContext, long userId, long groupId, List<long> deviceIds)
        {
            List<GroupDevice> result = new List<GroupDevice>();
            deviceIds.ForEach(deviceId =>
            {
                var record = new GroupDevice()
                {
                    UserId = userId,
                    DeviceId = deviceId,
                    GroupId = groupId,
                    CreatedAt = System.DateTime.Now,
                };
                dbContext.GroupDevice.Add(record);
                result.Add(record);
            });
            dbContext.SaveChanges();
            return result;
        }


        public static void BatchDelete(IotDbContext dbContext, long userId, long groupId, List<long> ids)
        {
            dbContext.GroupDevice
                .Where(x =>
                    x.UserId == userId
                    && x.GroupId == groupId
                    && (ids == null || ids.Contains(x.Id))
                ).UpdateFromQuery(x => new GroupDevice()
                {
                    DeletedAt = System.DateTime.Now,
                    EditedBy = userId
                });
        }
    }


    public class ViewGroupDevice
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public long? EditedBy { get; set; }
        public long DeviceId { get; set; }
        public long GroupId { get; set; }
        public long UserId { get; set; }
        public string DeviceName { get; set; }

    }
}
