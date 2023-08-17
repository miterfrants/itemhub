using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Collections.Generic;
using Homo.Core.Constants;

namespace Homo.IotApi
{
    [Route("v1/my/computed-functions")]
    [IotDashboardAuthorizeFactory()]
    public class MyComputedFunctionController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        public MyComputedFunctionController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "感測資料即時轉換" },
            Summary = "感測資料即時轉換 - 取得過濾資料",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getAllByKey([FromQuery] long? groupId, [FromQuery] List<DTOs.ComputedFunctionFilterByDevicePin> devicePins, [FromQuery] List<long> monitorIds, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return ComputedFunctionDataservice.GetAll(_dbContext, extraPayload.Id, groupId, devicePins, monitorIds);
        }

        [SwaggerOperation(
            Tags = new[] { "感測資料即時轉換" },
            Summary = "感測資料即時轉換 - 新增",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> add([FromBody] DTOs.CreateComputedFunction dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            if (dto.monitorId == null && (dto.deviceId == null || dto.pin == null))
            {
                throw new CustomException(ERROR_CODE.COMPUTED_FUNCTION_TARGET_ONE_OF_WITCH_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            return ComputedFunctionDataservice.Create(_dbContext, extraPayload.Id, dto);
        }

        [SwaggerOperation(
            Tags = new[] { "感測資料即時轉換" },
            Summary = "感測資料即時轉換 - 更新",
            Description = ""
        )]
        [HttpPatch]
        [Route("{id}")]
        public ActionResult<dynamic> update([FromRoute] long id, [FromBody] DTOs.UpdateComputedFunction dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            ComputedFunctionDataservice.Update(_dbContext, extraPayload.Id, id, dto);
            return new { status = "OK" };
        }
    }
}
