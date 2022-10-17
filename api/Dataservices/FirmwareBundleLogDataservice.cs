using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class FirmwareBundleLogDataservice
    {
        public static FirmwareBundleLog Create(IotDbContext dbContext, long ownerId, long deviceId, string bundleId, FIRMWARE_PROTOCOL protocol)
        {
            FirmwareBundleLog record = new FirmwareBundleLog();
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            record.DeviceId = deviceId;
            record.BundleId = bundleId;
            record.Protocol = protocol;

            dbContext.FirmwareBundleLog.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void UpdateFirmwareFile(IotDbContext dbContext, string filename, string bundleId)
        {
            dbContext.FirmwareBundleLog.Where(x => x.BundleId == bundleId && x.DeletedAt == null).UpdateFromQuery(x => new FirmwareBundleLog()
            {
                Filename = filename
            });
        }

        public static FirmwareBundleLog GetOneByBundleId(IotDbContext dbContext, string bundleId)
        {
            return dbContext.FirmwareBundleLog.Where(x => x.BundleId == bundleId && x.DeletedAt == null).FirstOrDefault();
        }
    }
}
