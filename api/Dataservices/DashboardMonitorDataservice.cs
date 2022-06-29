using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class DashboardMonitorDataservice
    {
        public static List<DashboardMonitor> GetAll(IotDbContext dbContext, long ownerId)
        {
            return dbContext.DashboardMonitor
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                )
                .OrderByDescending(x => x.Sort)
                .ToList();
        }


        public static DashboardMonitor Create(IotDbContext dbContext, long ownerId, DTOs.DashboardMonitor dto)
        {
            DashboardMonitor record = new DashboardMonitor();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            record.OwnerId = ownerId;
            dbContext.DashboardMonitor.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(IotDbContext dbContext, long ownerId, List<long> ids)
        {
            dbContext.DashboardMonitor.Where(x => x.OwnerId == ownerId && ids.Contains(x.Id)).UpdateFromQuery(x => new DashboardMonitor()
            {
                DeletedAt = DateTime.Now
            });
        }

        public static void Update(IotDbContext dbContext, long ownerId, long id, DTOs.DashboardMonitor dto)
        {
            DashboardMonitor record = dbContext.DashboardMonitor.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.EditedAt = DateTime.Now;
            dbContext.SaveChanges();
        }

    }
}
