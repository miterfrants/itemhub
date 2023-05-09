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
        public static void Create(
                IotDbContext iotDbContext, string dbc, string serverId, long ownerId, long deviceId, CommonLocalizer commmonLocalizer,
                string mailTemplatePath, string systemEmail, string sendGridApiKey, string smsClientUrl, string smsUsername, string smsPassword,
                string mqttUsername, string mqttPassword, List<MqttPublisher> localMqttPublishers,
                string websiteUrl,string adminEmail
            )
        {
            DeviceDataservice.Switch(iotDbContext, ownerId, deviceId, true);
            DeviceActivityLogDataservice.Create(iotDbContext, ownerId, deviceId);
            TimeoutOfflineDeviceService.StartAsync(serverId, ownerId, deviceId, dbc, commmonLocalizer, mailTemplatePath, systemEmail, sendGridApiKey, smsClientUrl, smsUsername, smsPassword, mqttUsername, mqttPassword, localMqttPublishers, websiteUrl, adminEmail);
        }
    }
}