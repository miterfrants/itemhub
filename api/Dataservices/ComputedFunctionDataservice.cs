using System.Collections.Generic;
using System.Linq;

namespace Homo.IotApi
{
    public class ComputedFunctionDataservice
    {
        public static List<ComputedFunction> GetAll(IotDbContext dbContext, long userId, List<DTOs.ComputedFunctionFilterByDevicePin> filterByDevicePins, List<long> monitorIds)
        {
            var deviceIds = filterByDevicePins.Select(x => x.deviceId).ToList();
            return dbContext.ComputedFunction.Where(x => x.DeletedAt == null
                && x.UserId == userId
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
    }
}
