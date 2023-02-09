using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using Homo.Core.Constants;
using System.Linq;
using Swashbuckle.AspNetCore.Annotations;


namespace Homo.IotApi
{
    [Route("v1/my/devices/{id}/pins")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyDevicePinController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        public MyDevicePinController(IotDbContext dbContext, IOptions<AppSettings> appSettings)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN - 取得裝置所有腳位",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long id, [FromQuery] PIN_TYPE? pinType, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            return DevicePinDataservice.GetAll(_dbContext, ownerId, new List<long>() { id }, pinType, null);
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN - 取得裝置單一腳位",
            Description = ""
        )]
        [HttpGet]
        [Route("{pin}")]
        public ActionResult<dynamic> getOne([FromRoute] long id, [FromRoute] string pin, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            return DevicePinDataservice.GetOne(_dbContext, ownerId, id, null, pin);
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN - 批次新增腳位",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> batchedCreate([FromRoute] long id, [FromBody] List<DTOs.DevicePinsData> dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            return DevicePinDataservice.BatchedCreate(_dbContext, id, ownerId, dto);
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN - 更新多筆腳位資料",
            Description = ""
        )]
        [HttpPatch]
        public ActionResult<dynamic> updatePins([FromRoute] long id, [FromBody] List<DTOs.DevicePinsData> dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            DevicePinDataservice.BatchedUpdate(_dbContext, id, ownerId, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN - 刪除多筆腳位資料",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> removeUnusedPins([FromRoute] long id, [FromQuery] string pins, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<string> listOfPins = pins.Split(",").ToList<string>();
            DevicePinDataservice.RemoveUnusePins(_dbContext, ownerId, id, listOfPins);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN - 更新腳位名稱",
            Description = ""
        )]
        [HttpPatch]
        [Route("{pin}")]
        public ActionResult<dynamic> updatePinName([FromRoute] long id, [FromRoute] string pin, [FromBody] DTOs.UpdateDevicePinName dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            DevicePinDataservice.UpdatePinName(_dbContext, ownerId, id, pin, dto.Name);
            return new { status = CUSTOM_RESPONSE.OK };
        }

    }
}
