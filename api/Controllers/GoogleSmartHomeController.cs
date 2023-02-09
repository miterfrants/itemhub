using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [IotDashboardAuthorizeFactory]
    [Route("v1/google-smart-home")]
    [Validate]
    public class GoogleSmartHomeController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        public GoogleSmartHomeController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "Google Smart Home" },
            Summary = "Google 接收指令 API",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> fulfillment([FromBody] DTOs.GoogleSmartHome dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            if (dto.Inputs[0].Intent == GOOGLE_SMART_HOME_INTENT.DEVICES_SYNC)
            {
                return onSync(dto, extraPayload);
            }
            else if (dto.Inputs[0].Intent == GOOGLE_SMART_HOME_INTENT.DEVICES_QUERY)
            {
                return onQuery(dto, extraPayload);
            }
            else if (dto.Inputs[0].Intent == GOOGLE_SMART_HOME_INTENT.DEVICES_EXECUTE)
            {
                return onExecute(dto, extraPayload);
            }
            return null;
        }

        private ActionResult<dynamic> onSync([FromBody] DTOs.GoogleSmartHome dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<DTOs.DevicePin> devicePins = DevicePinDataservice.GetAll(_dbContext, ownerId, null, null, null);
            List<DeviceInfo> deviceInfos = devicePins
                .Select(x =>
                {
                    string id = $"{x.DeviceId}-{x.Pin}";
                    return new DeviceInfo()
                    {
                        Name = new DeviceName() { Name = x.Name ?? $"{x.Device.Name} - {x.Pin}" },
                        Id = id,
                        Traits = x.PinType == PIN_TYPE.SWITCH ? new List<string>() { "action.devices.traits.OnOff" } :
                            x.PinType == PIN_TYPE.SENSOR ? new List<string>() { "action.devices.traits.SensorState" } : new List<string>() { "action.devices.traits.OnOff" },
                        Type = x.PinType == PIN_TYPE.SENSOR ? "action.devices.types.SENSOR" :
                            x.PinType == PIN_TYPE.SWITCH &&
                            (x.Name.Contains("燈") || x.Name.ToLower().Contains("light")) ? "action.devices.types.LIGHT" : "action.devices.types.SWITCH",
                        WillReportState = true,
                        Attributes = x.PinType == PIN_TYPE.SENSOR ? new
                        {
                            SensorStateSupported = new List<GoogleSensorStateSupported>() {
                                new GoogleSensorStateSupported() {
                                    Name = "Value", // Google 目前不支援 General Sensor
                                    NumericCapabilities = new GoogleNumericCapabilities() {
                                        RawValueUnit = "None"
                                    }
                                }
                            }
                        } : null
                    };
                })
                .ToList<DeviceInfo>();
            return new
            {
                RequestId = dto.RequestId,
                Payload = new
                {
                    AgentUserId = ownerId,
                    Devices = deviceInfos
                }
            };
        }

        private ActionResult<dynamic> onQuery([FromBody] DTOs.GoogleSmartHome dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<long> deviceIds = dto.Inputs[0].Payload.Devices.Select(x =>
            {
                string deviceId = x.Id.Split("-").ToList()[0];
                long longDeviceId = 0;
                long.TryParse(deviceId, out longDeviceId);
                return longDeviceId;
            }).ToList<long>();
            List<string> googleSmartHomeIds = dto.Inputs[0].Payload.Devices.Select(x => x.Id).ToList();
            List<Device> devices = DeviceDataservice.GetAllByIds(_dbContext, ownerId, deviceIds);
            List<DTOs.DevicePin> myDevicePins = DevicePinDataservice.GetAll(_dbContext, ownerId, deviceIds, null, null);

            return new
            {
                RequestId = dto.RequestId,
                Payload = new
                {
                    Devices = myDevicePins.Where(x =>
                    {
                        return googleSmartHomeIds.Where(y =>
                        {
                            List<string> arrayOfSplitString = y.Split("-").ToList();
                            long deviceId = 0;
                            string pin = arrayOfSplitString[1];
                            long.TryParse(arrayOfSplitString[0], out deviceId);
                            return x.DeviceId == deviceId && x.Pin == pin;
                        }).Count() > 0;
                    }).Select((x) =>
                    {
                        var device = devices.Where(device => device.Id == x.DeviceId).FirstOrDefault();
                        return new
                        {
                            DeviceId = $"{x.DeviceId}-{x.Pin}",
                            On = x.Value == 1,
                            Status = "SUCCESS",
                            Online = device == null ? false : device.Online,
                            CurrentSensorStateData = new List<dynamic>() {
                                new {
                                    Name = "Value",
                                    CurrentSensorState = x.Value
                                }
                            }
                        };
                    })
                    .Where(x => x != null)
                    .ToDictionary(x => x.DeviceId)
                }
            };
        }

        private ActionResult<dynamic> onExecute([FromBody] DTOs.GoogleSmartHome dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<DeviceCommand> commands = dto.Inputs[0].Payload.Commands;
            List<dynamic> commandResult = new List<dynamic>();

            commands.ForEach(command =>
            {
                for (int i = 0; i < command.Devices.Count; i++)
                {
                    List<string> arrayOfSplitId = command.Devices[i].Id.Split("-").ToList();
                    long deviceId = 0;
                    string pin = arrayOfSplitId[1];
                    long.TryParse(arrayOfSplitId[0], out deviceId);
                    DevicePinDataservice.UpdateValueByDeviceId(_dbContext, ownerId, deviceId, pin, command.Execution[i].Params.On ? 1 : 0);
                    Device device = DeviceDataservice.GetOne(_dbContext, ownerId, deviceId);
                    commandResult.Add(new
                    {
                        Ids = new List<string>() { command.Devices[i].Id },
                        Status = "SUCCESS",
                        States = new List<dynamic>() {new {
                                DeviceId = command.Devices[i].Id,
                                On = command.Execution[i].Params.On,
                                Status = "SUCCESS",
                                Online = device.Online,
                            }},
                    });
                }
            });

            return new
            {
                RequestId = dto.RequestId,
                Payload = new
                {
                    Commands = commandResult
                }
            };
        }
    }

    public class DeviceCommand
    {
        public List<ExecuteDevice> Devices { get; set; }
        public List<DeviceExecution> Execution { get; set; }
    }

    public class ExecuteDevice
    {
        public string Id { get; set; }

    }

    public class DeviceExecution
    {
        public string Command { get; set; }
        public GoogleDeviceOnOffParam Params { get; set; }
    }

    public class GoogleDeviceOnOffParam
    {
        public bool On { get; set; }
    }

    public class DeviceInfo
    {
        public string Id { get; set; }
        public DeviceName Name { get; set; }
        public List<string> Traits { get; set; }
        public string Type { get; set; }
        public bool WillReportState { get; set; }
        public dynamic Attributes { get; set; }
    }

    public class DeviceName
    {
        public List<string> DefaultNames { get; set; }
        public List<string> Nicknames { get; set; }
        public string Name { get; set; }
    }

    public class GoogleDeviceState
    {
        public long OwnerId { get; set; }
        public long DeviceId { get; set; }
        public string Status { get; set; }
        public bool Online { get; set; }
        public bool On { get; set; }
    }

    public class GoogleSensorStateSupported
    {
        public string Name { get; set; }
        public GoogleDescriptiveCapabilities DescriptiveCapabilities { get; set; }
        public GoogleNumericCapabilities NumericCapabilities { get; set; }
    }

    public class GoogleDescriptiveCapabilities
    {
        public List<string> AvailableStates { get; set; }
    }

    public class GoogleNumericCapabilities
    {
        public string RawValueUnit { get; set; }
    }
}
