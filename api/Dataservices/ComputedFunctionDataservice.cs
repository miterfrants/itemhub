using System.Collections.Generic;
using System.Linq;

namespace Homo.IotApi
{
    public class ComputedFunctionDataservice
    {
        public static List<ComputedFunction> GetAll(IotDbContext dbContext, long userId, long? groupId, List<DTOs.ComputedFunctionFilterByDevicePin> filterByDevicePins, List<long> monitorIds)
        {
            var deviceIds = filterByDevicePins.Select(x => x.deviceId).ToList();
            return dbContext.ComputedFunction.Where(x => x.DeletedAt == null
                && x.UserId == userId
                && (groupId == null || x.GroupId == groupId)
                && (
                    (filterByDevicePins.Count > 0 && x.Target == COMPUTED_TARGET.SENSOR_PIN && deviceIds.Contains(x.DeviceId))
                    || (monitorIds != null && x.Target == COMPUTED_TARGET.DASHBOARD_MONITOR && x.MonitorId != null && monitorIds.Contains(x.MonitorId.GetValueOrDefault()))
                )
            ).ToList()
            .Where(x =>
                (x.Target == COMPUTED_TARGET.SENSOR_PIN && filterByDevicePins.Count(y => y.deviceId == x.DeviceId && y.pin == x.Pin) > 0)
                || filterByDevicePins.Count == 0
            ).ToList();
        }

        public static ComputedFunction Create(IotDbContext dbContext, long userId, DTOs.CreateComputedFunction dto)
        {
            var newOne = new ComputedFunction();
            newOne.DeviceId = dto.deviceId;
            newOne.Pin = dto.pin;
            newOne.MonitorId = dto.monitorId;
            newOne.Func = dto.func;
            newOne.UserId = userId;
            newOne.SourceDeviceId = dto.sourceDeviceId;
            newOne.SourcePin = dto.sourcePin;
            dbContext.ComputedFunction.Add(newOne);
            dbContext.SaveChanges();
            return newOne;
        }

        public static void Update(IotDbContext dbContext, long userId, long id, DTOs.UpdateComputedFunction dto)
        {

            dbContext.ComputedFunction.Where(x =>
                x.Id == id
                && x.UserId == userId
                && x.DeletedAt == null
            ).UpdateFromQuery(x => new ComputedFunction()
            {
                Func = dto.func
            });
        }
    }
}
