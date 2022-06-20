using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Homo.Core.Constants;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [IotDashboardAuthorizeFactory]
    [Route("v1/my/triggers")]
    [Validate]
    public class TriggerController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        public TriggerController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "觸發" },
            Summary = "觸發 - 建立新的觸發",
            Description = ""
        )]
        [HttpPost]
        [TriggerValidate()]
        public ActionResult<dynamic> create([FromBody] DTOs.Trigger dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            Trigger rewRecord = TriggerDataservice.Create(_dbContext, extraPayload.Id, dto);
            return rewRecord;
        }

        [SwaggerOperation(
            Tags = new[] { "觸發" },
            Summary = "觸發 - 取得觸發分頁列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromQuery] int page, [FromQuery] int limit,
            [FromQuery] long? sourceDeviceId,
            [FromQuery] string sourcePin,
            [FromQuery] string sourceDeviceName,
            [FromQuery] long? destinationDeviceId,
            [FromQuery] string destinationPin,
            [FromQuery] string destinationDeviceName,
            [FromQuery] string name,
            Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return new
            {
                triggers = TriggerDataservice.GetList(_dbContext, page, limit, extraPayload.Id, sourceDeviceId, sourcePin, sourceDeviceName, destinationDeviceId, destinationPin, destinationDeviceName, name),
                rowNum = TriggerDataservice.GetRowNum(_dbContext, extraPayload.Id, sourceDeviceId, sourcePin, sourceDeviceName, destinationDeviceId, destinationPin, destinationDeviceName, name)
            };
        }

        [SwaggerOperation(
            Tags = new[] { "觸發" },
            Summary = "觸發 - 更新單一觸發資料",
            Description = ""
        )]
        [HttpPatch]
        [Route("{id}")]
        [TriggerValidate()]
        public ActionResult<dynamic> update([FromRoute] long id,
            [FromBody] DTOs.Trigger dto,
            Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            TriggerDataservice.Update(_dbContext, extraPayload.Id, id, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "觸發" },
            Summary = "觸發 - 取得單一觸發資料",
            Description = ""
        )]
        [HttpGet]
        [Route("{id}")]
        public ActionResult<dynamic> get([FromRoute] long id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return TriggerDataservice.GetOne(_dbContext, extraPayload.Id, id, null, null, null, null);
        }

        [SwaggerOperation(
            Tags = new[] { "觸發" },
            Summary = "觸發 - 刪除多筆觸發資料",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            TriggerDataservice.BatchDelete(_dbContext, extraPayload.Id, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

    }
}
