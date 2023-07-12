using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;
using System.Linq;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/groups/{groupId}/devices")]
    [IotDashboardAuthorizeFactory()]
    public class MyGroupDevicesController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        public MyGroupDevicesController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 取得裝置列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long groupId, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return GroupDeviceDataservice.GetAll(_dbContext, extraPayload.Id, groupId, null);
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 加入裝置",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> append([FromRoute] long groupId, [FromBody] List<long> deviceIds, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            var exists = GroupDeviceDataservice.GetAll(_dbContext, extraPayload.Id, groupId, deviceIds);
            if (exists.Count > 0)
            {
                throw new CustomException(ERROR_CODE.GROUP_DEVICES_EXISTS, System.Net.HttpStatusCode.Forbidden);
            }
            var groupDevices = GroupDeviceDataservice.BatchCreate(_dbContext, extraPayload.Id, groupId, deviceIds);
            var result = new List<ViewGroupDevice>();
            DeviceDataservice.GetAll(_dbContext, extraPayload.Id, deviceIds).ForEach((device) =>
            {
                var groupDevice = groupDevices.Where(x => x.DeviceId == device.Id).FirstOrDefault();
                result.Add(new ViewGroupDevice()
                {
                    Id = groupDevice.Id,
                    CreatedAt = groupDevice.CreatedAt,
                    EditedAt = groupDevice.EditedAt,
                    EditedBy = groupDevice.EditedBy,
                    DeviceId = groupDevice.DeviceId,
                    GroupId = groupDevice.GroupId,
                    UserId = groupDevice.UserId,
                    DeviceName = device.Name
                });
            });
            return result;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 批次刪除裝置",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> delete([FromRoute] long groupId, [FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            GroupDeviceDataservice.BatchDelete(_dbContext, extraPayload.Id, groupId, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
