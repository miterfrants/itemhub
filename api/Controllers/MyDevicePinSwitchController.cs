using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Homo.Core.Constants;

namespace Homo.IotApi
{
    [IotAuthorizeFactory]
    [Route("v1/me/devices/{id}/switches")]
    [Validate]
    public class MyDeviceSwitchController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        public MyDeviceSwitchController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return DevicePinSwitchDataservice.GetAll(_dbContext, extraPayload.Id, new List<long>() { id }, null, null);
        }

        [HttpPost]
        public ActionResult<dynamic> create([FromRoute] long id, [FromBody] DTOs.DevicePinSwitch dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            DevicePinSwitch state = DevicePinSwitchDataservice.GetOne(_dbContext, id, dto.Mode, dto.Pin);
            if (state != null)
            {
                throw new CustomException(IotApi.ERROR_CODE.DEVICE_STATE_EXISTS, System.Net.HttpStatusCode.BadRequest);
            }
            return DevicePinSwitchDataservice.Create(_dbContext, extraPayload.Id, id, dto);
        }

        [HttpPatch]
        [Route("{pin}")]
        public ActionResult<dynamic> update([FromRoute] long id, [FromRoute] string pin, [FromBody] DTOs.DevicePinSwitchValue dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            DevicePinSwitchDataservice.UpdateValueByDeviceId(_dbContext, extraPayload.Id, id, pin, dto.Value);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
