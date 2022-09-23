using System;
using System.Linq;
using System.Collections.Generic;
using Homo.Core.Constants;
using Homo.AuthApi;
using Homo.Api;
using System.Threading.Tasks;

namespace Homo.IotApi
{

    public class DeviceStateHelper
    {
        public static void Create(IotDbContext iotDbContext, string dbc, long ownerId, long deviceId
            )
        {
            DeviceDataservice.Switch(iotDbContext, ownerId, deviceId, true);
            DeviceActivityLogDataservice.Create(iotDbContext, ownerId, deviceId);
            TimeoutOfflineDeviceService.StartAsync(ownerId, deviceId, dbc);
        }
    }
}