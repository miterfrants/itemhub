using System;
using System.Linq;
using System.Collections.Generic;
using Homo.Core.Constants;
using Homo.AuthApi;
using Homo.Api;
using System.Threading.Tasks;

namespace Homo.IotApi
{

    public class DeviceSensorHelper
    {
        public static async Task Create(DBContext dbContext, IotDbContext iotDbContext, long ownerId,
            long deviceId, string pin, DTOs.CreateSensorLog dto, CommonLocalizer commonLocalizer,
            string mailTemplatePath, string websiteUrl, string systemEmail, string adminEmail, string smsUsername, string smsPassword,
            string smsClientUrl, string sendGridApiKey,
            List<MqttPublisher> localMqttPublishers, bool isVIP

            )
        {
            DevicePin devicePin = DevicePinDataservice.GetOneByDeviceIdAndPin(iotDbContext, ownerId, deviceId, null, pin);

            if (devicePin == null)
            {
                throw new CustomException(ERROR_CODE.DEVICE_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }

            SensorLogDataservice.Create(iotDbContext, ownerId, deviceId, pin, dto);

        }
    }
}