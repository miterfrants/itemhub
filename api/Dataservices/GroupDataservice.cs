using System;
using System.Collections.Generic;
using System.Linq;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public class GroupDataservice
    {
        public static List<Group> GetAll(DBContext dbContext, List<long> groupIds)
        {
            return dbContext.Group
                .Where(x =>
                    x.DeletedAt == null
                    && groupIds.Contains(x.Id)
                )
                .OrderByDescending(x => x.Id)
                .ToList();
        }
    }
}
