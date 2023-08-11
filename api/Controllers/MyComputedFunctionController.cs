using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Collections.Generic;

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
        public ActionResult<dynamic> getAllByKey([FromQuery] List<DTOs.ComputedFunctionFilterByDevicePin> devicePins, [FromQuery] List<long> monitorIds, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return ComputedFunctionDataservice.GetAll(_dbContext, extraPayload.Id, devicePins, monitorIds);
        }

        [SwaggerOperation(
            Tags = new[] { "感測資料即時轉換" },
            Summary = "感測資料即時轉換 - 新增",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> add([FromBody] DTOs.CreateComputedFunction dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
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
