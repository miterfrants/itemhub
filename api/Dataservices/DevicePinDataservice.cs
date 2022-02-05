using System.Collections.Generic;
using System.Linq;
using System;

namespace Homo.IotApi
{
    public class DevicePinDataservice
    {
        public static List<DevicePin> GetList(IotDbContext dbContext, long? ownerId, long deviceId)
        {
            List<DevicePin> pinsFromSensorData = dbContext.DevicePinSensor
                .Where(x =>
                    x.DeletedAt == null
                    && x.CreatedAt >= DateTime.Now.AddMinutes(-30)
                    && x.DeviceId == deviceId
                    && x.OwnerId == ownerId
                )
                .GroupBy(x => new
                {
                    x.DeviceId,
                    x.Pin
                })
                .Select(g => new DevicePin()
                {
                    DeviceId = g.Key.DeviceId,
                    Pin = g.Key.Pin
                })
                .ToList<DevicePin>();

            List<DevicePin> pinsFromSwitch = dbContext.DevicePinSwitch
                .Where(x => x.DeletedAt == null
                    && x.DeviceId == deviceId
                    && x.OwnerId == ownerId
                )
                .Select(x => new DevicePin()
                {
                    DeviceId = x.DeviceId,
                    Pin = x.Pin
                })
                .ToList<DevicePin>();

            pinsFromSensorData.AddRange(pinsFromSwitch);
            return pinsFromSensorData;
        }
    }

    public class DevicePin
    {
        public string Pin { get; set; }
        public long DeviceId { get; set; }
    }
}
