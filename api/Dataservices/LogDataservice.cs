using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class LogDataservice
    {

        public static Log Create(IotDbContext dbContext, DTOs.Log dto)
        {
            Log record = new Log();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            dbContext.Log.Add(record);
            dbContext.SaveChanges();
            return record;
        }
    }
}
