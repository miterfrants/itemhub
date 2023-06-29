using MQTTnet;
using System.Collections.Generic;

namespace Homo.IotApi
{

    public class DeviceSwitchHelper
    {
        public static void Update(IotDbContext iotDbContext, long userId,
            long deviceId, string pin, DTOs.DevicePinSwitchValue dto, List<MqttPublisher> localMqttPublishers
            )
        {
            // http
            DevicePinDataservice.UpdateValueByDeviceId(iotDbContext, userId, deviceId, pin, dto.Value);

            // mqtt
            localMqttPublishers.ForEach(publisher =>
            {
                try
                {
                    publisher.Client.PublishAsync(new MqttApplicationMessageBuilder()
                        .WithTopic($"{deviceId}/{pin}/switch")
                        .WithPayload(
                            Newtonsoft.Json.JsonConvert.SerializeObject(
                                new DTOs.DevicePinSwitchValue { Value = dto.Value }
                            )
                        )
                        .Build());
                }
                catch (System.Exception)
                {

                    System.Console.WriteLine($"Client not connected: {publisher.IP}, {publisher.Id}");
                }

            });

            // log
            LogDataservice.Create(iotDbContext, new DTOs.Log()
            {
                DeviceId = deviceId,
                Pin = pin,
                Message = $"切換開關: {dto.Value}",
                UserId = userId
            });
        }
    }
}