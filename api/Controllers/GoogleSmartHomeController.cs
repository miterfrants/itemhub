using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Newtonsoft.Json;

namespace Homo.IotApi
{
    [IotAuthorizeFactory]
    [Route("v1/google-smart-home")]
    [Validate]
    public class GoogleSmartHomeController : ControllerBase
    {
        private readonly string GoogleDevicePin = "D0";
        private static List<DevicePinSwitch> DevicePinStates = new List<DevicePinSwitch>();
        private readonly IotDbContext _dbContext;
        public GoogleSmartHomeController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

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
            List<Device> devices = DeviceDataservice.GetAll(_dbContext, ownerId);
            List<DeviceInfo> deviceInfos = devices
                .Select(x =>
                {
                    var temp = JsonConvert.DeserializeObject<DeviceInfo>(x.Info);
                    temp.Name = new DeviceName() { Name = x.Name };
                    temp.Id = x.Id.ToString();
                    return temp;
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
            List<Device> devices = DeviceDataservice.GetAll(_dbContext, ownerId);
            List<long> myDeviceIds = devices.Select(x => x.Id).ToList<long>();
            List<DevicePinSwitch> myDeviceStates = DevicePinSwitchDataservice.GetAll(_dbContext, ownerId, myDeviceIds, (byte)DEVICE_MODE.SWITCH, this.GoogleDevicePin);
            List<long> existsStateDeviceIds = myDeviceStates.Select(x => x.DeviceId).ToList();
            // create device state to memory
            devices.Where(x => !existsStateDeviceIds.Contains(x.Id)).ToList().ForEach(device =>
            {
                // Google Smart Home Device Default Pin: D0
                DevicePinSwitchDataservice.Create(_dbContext, ownerId, device.Id, new DTOs.DevicePinSwitch()
                {
                    Pin = GoogleDevicePin,
                    Mode = (byte)DEVICE_MODE.SWITCH,
                    Value = 0
                });
            });
            return new
            {
                RequestId = dto.RequestId,
                Payload = new
                {
                    Devices = devices.Select((x) =>
                    {
                        var deviceState = myDeviceStates.Where(y => y.DeviceId == x.Id).FirstOrDefault();
                        return new
                        {
                            DeviceId = deviceState.DeviceId.ToString(),
                            On = deviceState.Value == 1,
                            Status = "SUCCESS",
                            Online = x.Online
                        };
                    }).ToDictionary(x => x.DeviceId)
                }
            };
        }

        private ActionResult<dynamic> onExecute([FromBody] DTOs.GoogleSmartHome dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<DeviceCommand> commands = Newtonsoft.Json.JsonConvert.DeserializeObject<List<DeviceCommand>>(dto.Inputs[0].Payload.GetProperty("commands").ToString());
            List<dynamic> commandResult = new List<dynamic>();
            commands.ForEach(command =>
            {
                for (int i = 0; i < command.Devices.Count; i++)
                {
                    DevicePinSwitchDataservice.UpdateValueByDeviceId(_dbContext, ownerId, command.Devices[i].Id, GoogleDevicePin, command.Execution[i].Params.on.Value ? 1 : 0);
                }
            });
            List<long> myDeviceIds = commands[0].Devices.Select(x => x.Id).ToList<long>();
            List<DevicePinSwitch> states = DevicePinSwitchDataservice.GetAll(_dbContext, ownerId, myDeviceIds, (byte)DEVICE_MODE.SWITCH, this.GoogleDevicePin);
            List<Device> devices = DeviceDataservice.GetAllByIds(_dbContext, ownerId, states.Select(x => x.DeviceId).ToList<long>());
            List<GoogleDeviceState> statesForGoogle = states
            .Select(x => new GoogleDeviceState()
            {
                DeviceId = x.DeviceId,
                On = x.Value == 1,
                Status = "SUCCESS",
                Online = devices.Where(y => y.Id == x.DeviceId).FirstOrDefault().Online,
            }).ToList();

            return new
            {
                RequestId = dto.RequestId,
                Payload = new
                {
                    Commands = new List<dynamic>()
                    {
                        new {
                            Ids = myDeviceIds.Select(x=> x.ToString()).ToList<string>(),
                            Status = "SUCCESS",
                            States = statesForGoogle.Select(x=>new {
                                DeviceId = x.DeviceId.ToString(),
                                On = x.On,
                                Status = x.Status,
                                Online = x.Online,
                            }).ToList()
                        }
                    }

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
        public long Id { get; set; }

    }

    public class DeviceExecution
    {
        public string Command { get; set; }
        public dynamic Params { get; set; }
    }

    public class DeviceInfo
    {
        public string Id { get; set; }
        public DeviceName Name { get; set; }
        public List<string> Traits { get; set; }
        public string Type { get; set; }
        public bool WillReportState { get; set; }
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
}
