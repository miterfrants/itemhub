using System;
using System.Collections.Generic;
using System.Linq;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public class GroupDeviceDataservice
    {
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
