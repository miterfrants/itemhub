using System;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Homo.Core.Constants;
using System.Linq;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public class TriggerValidateAttribute : ActionFilterAttribute
    {
        public TriggerValidateAttribute()
        {
        }
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            context.ActionArguments.TryGetValue("dto", out var dtoRaw);
            DTOs.Trigger dto = (DTOs.Trigger)dtoRaw;
            if (dto.Type == TRIGGER_TYPE.CHANGE_DEVICE_STATE && dto.DestinationDeviceId == null)
            {
                throw new CustomException(ERROR_CODE.TRIGGER_DEST_DEVICE_ID_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            else if (dto.Type == TRIGGER_TYPE.CHANGE_DEVICE_STATE && dto.DestinationDeviceTargetState == null)
            {
                throw new CustomException(ERROR_CODE.TRIGGER_DEST_DEVICE_TARGET_STATE_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            else if (dto.Type == TRIGGER_TYPE.CHANGE_DEVICE_STATE && System.String.IsNullOrEmpty(dto.DestinationPin))
            {
                throw new CustomException(ERROR_CODE.TRIGGER_DEST_PIN_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            else if (dto.Type == TRIGGER_TYPE.NOTIFICATION && System.String.IsNullOrEmpty(dto.Email) && System.String.IsNullOrEmpty(dto.Phone))
            {
                throw new CustomException(ERROR_CODE.TRIGGER_NOTIFICATION_NEEDS_DATA, System.Net.HttpStatusCode.BadRequest);
            }
        }
    }
}