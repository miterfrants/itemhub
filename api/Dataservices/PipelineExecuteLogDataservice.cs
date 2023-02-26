using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class PipelineExecuteLogDataservice
    {
        public static PipelineExecuteLog Create(IotDbContext dbContext, long ownerId, DTOs.PipelineExecuteLog dto)
        {
            PipelineExecuteLog record = new PipelineExecuteLog();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.CreatedAt = DateTime.Now;
            dbContext.PipelineExecuteLog.Add(record);
            dbContext.SaveChanges();
            return record;
        }
    }
}
