using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    public class OauthClientDataservice
    {
        public static List<OauthClient> GetList(IotDbContext dbContext, long ownerId, bool isDeviceClient, long? deviceId, int page, int limit)
        {
            return dbContext.OauthClient
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && (isDeviceClient == false && x.DeviceId == null)
                    && (deviceId == null && x.DeviceId == deviceId)
                )
                .OrderByDescending(x => x.Id)
                .Skip(limit * (page - 1))
                .Take(limit)
                .ToList();
        }

        public static List<OauthClient> GetAll(IotDbContext dbContext, long ownerId, bool isDeviceClient, long? deviceId)
        {
            return dbContext.OauthClient
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && (isDeviceClient == false && x.DeviceId == null)
                    && (deviceId == null && x.DeviceId == deviceId)
                )
                .OrderByDescending(x => x.Id)
                .ToList();
        }
        public static int GetRowNum(IotDbContext dbContext, long ownerId, bool isDeviceClient, long? deviceId)
        {
            return dbContext.OauthClient
                .Where(x =>
                    x.DeletedAt == null
                    && x.OwnerId == ownerId
                    && (isDeviceClient == false && x.DeviceId == null)
                    && (deviceId == null && x.DeviceId == deviceId)
                )
                .Count();
        }

        public static OauthClient GetOne(IotDbContext dbContext, long ownerId, long id)
        {
            return dbContext.OauthClient.FirstOrDefault(x => x.DeletedAt == null
            && x.OwnerId == ownerId
            && x.Id == id);
        }

        public static OauthClient GetOneByDeviceId(IotDbContext dbContext, long ownerId, long deviceId)
        {
            return dbContext.OauthClient.FirstOrDefault(x => x.DeletedAt == null
            && x.OwnerId == ownerId
            && x.DeviceId == deviceId);
        }

        public static OauthClient GetOneByClientId(IotDbContext dbContext, string clientId)
        {
            return dbContext.OauthClient.FirstOrDefault(x =>
                x.DeletedAt == null
                && x.ClientId == clientId
            );
        }

        public static OauthClient Create(IotDbContext dbContext, long ownerId, DTOs.OauthClient dto, string hashClientSecrets, string salt)
        {
            OauthClient record = new OauthClient();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            record.HashClientSecrets = hashClientSecrets;
            record.OwnerId = ownerId;
            record.Salt = salt;
            record.CreatedAt = DateTime.Now;
            dbContext.OauthClient.Add(record);
            dbContext.SaveChanges();
            return record;
        }

        public static void BatchDelete(IotDbContext dbContext, long ownerId, List<long> ids)
        {
            foreach (long id in ids)
            {
                OauthClient record = new OauthClient { Id = id, OwnerId = ownerId };
                dbContext.Attach<OauthClient>(record);
                record.DeletedAt = DateTime.Now;
            }
            dbContext.SaveChanges();
        }

        public static void Update(IotDbContext dbContext, long ownerId, long id, DTOs.OauthClient dto)
        {
            OauthClient record = dbContext.OauthClient.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
            foreach (var propOfDTO in dto.GetType().GetProperties())
            {
                var value = propOfDTO.GetValue(dto);
                var prop = record.GetType().GetProperty(propOfDTO.Name);
                prop.SetValue(record, value);
            }
            dbContext.SaveChanges();
        }


        public static void RevokeSecret(IotDbContext dbContext, long ownerId, long id, string hashClientSecrets, string salt)
        {
            OauthClient record = dbContext.OauthClient.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
            record.HashClientSecrets = hashClientSecrets;
            record.Salt = salt;
            dbContext.SaveChanges();
        }

        public static void Delete(IotDbContext dbContext, long ownerId, long id)
        {
            OauthClient record = dbContext.OauthClient.Where(x => x.Id == id && x.OwnerId == ownerId).FirstOrDefault();
            record.DeletedAt = DateTime.Now;
            dbContext.SaveChanges();
        }

        public static void DeleteByDeviceId(IotDbContext dbContext, long ownerId, long deviceId)
        {
            dbContext.OauthClient.Where(x => x.DeviceId == deviceId && x.OwnerId == ownerId).UpdateFromQuery(x => new OauthClient() { DeletedAt = DateTime.Now });
        }
    }
}
