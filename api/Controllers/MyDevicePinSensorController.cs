using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Homo.Core.Constants;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/devices/{id}/sensors")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyDevicePinSensorController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        public MyDevicePinSensorController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 感測 - 新增特定裝置感測資料",
            Description = ""
        )]
        [HttpPost]
        [FilterRequestFactory]
        [Route("{pin}")]
        public ActionResult<dynamic> create([FromRoute] long id, [FromRoute] string pin, [FromBody] DTOs.CreateSensorLog dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            SensorLogDataservice.Create(_dbContext, extraPayload.Id, id, pin, dto);
            List<Trigger> triggers = TriggerDataservice.GetAll(_dbContext, extraPayload.Id, id, pin);
            List<Trigger> beTriggeredList = new List<Trigger>();
            triggers.ForEach(trigger =>
            {
                if (trigger.Operator == TRIGGER_OPERATOR.B && dto.Value > trigger.SourceThreshold)
                {
                    beTriggeredList.Add(trigger);
                    DevicePinDataservice.UpdateValueByDeviceId(_dbContext, extraPayload.Id, trigger.DestinationDeviceId.GetValueOrDefault(), trigger.DestinationPin, trigger.DestinationDeviceTargetState);
                }
                else if (trigger.Operator == TRIGGER_OPERATOR.BE && dto.Value >= trigger.SourceThreshold)
                {
                    beTriggeredList.Add(trigger);
                    DevicePinDataservice.UpdateValueByDeviceId(_dbContext, extraPayload.Id, trigger.DestinationDeviceId.GetValueOrDefault(), trigger.DestinationPin, trigger.DestinationDeviceTargetState);
                }
                else if (trigger.Operator == TRIGGER_OPERATOR.L && dto.Value < trigger.SourceThreshold)
                {
                    beTriggeredList.Add(trigger);
                    DevicePinDataservice.UpdateValueByDeviceId(_dbContext, extraPayload.Id, trigger.DestinationDeviceId.GetValueOrDefault(), trigger.DestinationPin, trigger.DestinationDeviceTargetState);
                }
                else if (trigger.Operator == TRIGGER_OPERATOR.LE && dto.Value <= trigger.SourceThreshold)
                {
                    beTriggeredList.Add(trigger);
                    DevicePinDataservice.UpdateValueByDeviceId(_dbContext, extraPayload.Id, trigger.DestinationDeviceId.GetValueOrDefault(), trigger.DestinationPin, trigger.DestinationDeviceTargetState);
                }
                else if (trigger.Operator == TRIGGER_OPERATOR.E && dto.Value == trigger.SourceThreshold)
                {
                    beTriggeredList.Add(trigger);
                    DevicePinDataservice.UpdateValueByDeviceId(_dbContext, extraPayload.Id, trigger.DestinationDeviceId.GetValueOrDefault(), trigger.DestinationPin, trigger.DestinationDeviceTargetState);
                }
            });

            TriggerLogDataservice.BatchedCreate(_dbContext, beTriggeredList);
            return new { status = CUSTOM_RESPONSE.OK };
        }


        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 PIN 感測 - 取得感測資料分頁列表",
            Description = ""
        )]
        [HttpGet]
        [Route("{pin}")]
        public ActionResult<dynamic> getList([FromRoute] long id, [FromRoute] string pin, [FromQuery] int page, [FromQuery] int limit, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return SensorLogDataservice.GetList(_dbContext, extraPayload.Id, new List<long>() { id }, pin, page, limit);
        }
    }
}
