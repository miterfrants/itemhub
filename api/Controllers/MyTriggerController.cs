using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Homo.Core.Constants;

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

        [HttpPost]
        public ActionResult<dynamic> create([FromBody] DTOs.Trigger dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            Trigger rewRecord = TriggerDataservice.Create(_dbContext, extraPayload.Id, dto);
            return rewRecord;
        }

        [HttpGet]
        public ActionResult<dynamic> getList([FromQuery] int page, [FromQuery] int limit,
            [FromQuery] long? sourceDeviceId,
            [FromQuery] string sourcePin,
            [FromQuery] string sourceDeviceName,
            [FromQuery] long? destinationDeviceId,
            [FromQuery] string destinationPin,
            [FromQuery] string destinationDeviceName,
            Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return new
            {
                triggers = TriggerDataservice.GetList(_dbContext, page, limit, extraPayload.Id, sourceDeviceId, sourcePin, sourceDeviceName, destinationDeviceId, destinationPin, destinationDeviceName),
                rowNum = TriggerDataservice.GetRowNum(_dbContext, extraPayload.Id, sourceDeviceId, sourcePin, sourceDeviceName, destinationDeviceId, destinationPin, destinationDeviceName)
            };
        }

        [HttpPatch]
        [Route("{id}")]
        public ActionResult<dynamic> update([FromRoute] long id,
            [FromBody] DTOs.Trigger dto,
            Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            TriggerDataservice.Update(_dbContext, extraPayload.Id, id, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [HttpGet]
        [Route("{id}")]
        public ActionResult<dynamic> get([FromRoute] long id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return TriggerDataservice.GetOne(_dbContext, extraPayload.Id, id, null, null, null, null);
        }

        [HttpDelete]
        [Route("{id}")]
        public ActionResult<dynamic> delete([FromRoute] long id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            TriggerDataservice.Delete(_dbContext, ownerId, id);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            TriggerDataservice.BatchDelete(_dbContext, extraPayload.Id, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
