using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class DeviceUploadedImageDataservice
    {
        public static DeviceUploadedImage GetLastOne(IotDbContext dbContext, long ownerId, long deviceId)
        {
            return dbContext.DeviceUploadedImage
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && x.DeviceId == deviceId
                )
                .OrderByDescending(x => x.Id)
                .FirstOrDefault();
        }

        public static int GetRowNums(IotDbContext dbContext, long ownerId, long deviceId)
        {
            return dbContext.DeviceUploadedImage
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && x.DeviceId == deviceId
                )
                .Count();
        }

        public static DeviceUploadedImage GetOneByFilename(IotDbContext dbContext, long ownerId, long deviceId, string filename)
        {
            return dbContext.DeviceUploadedImage.FirstOrDefault(x =>
                x.DeletedAt == null
                && x.DeviceId == deviceId
                && x.OwnerId == ownerId
                && x.Filename == filename
            );
        }

        public static DeviceUploadedImage Create(IotDbContext dbContext, long ownerId, long deviceId, DTOs.DeviceUploadedImage dto)
        {
            DeviceUploadedImage record = new DeviceUploadedImage();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            record.DeviceId = deviceId;
            dbContext.DeviceUploadedImage.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(IotDbContext dbContext, long ownerId, long editedBy, long deviceId, List<long> ids)
        {
            foreach (long id in ids)
            {
                DeviceUploadedImage record = new DeviceUploadedImage { Id = id, OwnerId = ownerId, DeviceId = deviceId };
                dbContext.Attach<DeviceUploadedImage>(record);
                record.DeletedAt = DateTime.Now;
                record.EditedBy = editedBy;
            }
            dbContext.SaveChanges();
        }

    }
}
