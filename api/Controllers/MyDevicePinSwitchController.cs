using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Homo.Core.Constants;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/devices/{id}/switches")]
    [IotDashboardAuthorizeFactory]
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
            return DevicePinDataservice.GetAll(_dbContext, extraPayload.Id, new List<long>() { id }, DEVICE_MODE.SWITCH, null);
        }


        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 開關 - 切換開關",
            Description = ""
        )]
        [HttpPatch]
        [Route("{pin}")]
        public ActionResult<dynamic> update([FromRoute] long id, [FromRoute] string pin, [FromBody] DTOs.DevicePinSwitchValue dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            DevicePinDataservice.UpdateValueByDeviceId(_dbContext, extraPayload.Id, id, pin, dto.Value);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
