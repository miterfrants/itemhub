using Microsoft.AspNetCore.Mvc;
using Homo.AuthApi;
using Swashbuckle.AspNetCore.Annotations;
using System.Linq;

namespace Homo.IotApi
{
    [Route("v1/groups/{groupId}/devices")]
    [IotDashboardAuthorizeFactory()]
    [GroupAuthorizeFactory()]
    public class GroupDeviceController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        public GroupDeviceController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 取得群組裝置列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromRoute] long groupId, [FromQuery] int limit, [FromQuery] int page, [FromQuery] string name, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return new
            {
                devices = GroupDeviceDataservice.GetList(_dbContext, extraPayload.Id, groupId, page, limit).Select(x =>
                new
                {
                    x.CreatedAt,
                    x.DeletedAt,
                    x.EditedAt,
                    x.Id,
                    x.Info,
                    x.Microcontroller,
                    x.Name,
                    x.Online,
                    x.OwnerId,
                    x.Protocol,
                    x.OfflineNotificationTarget,
                    x.IsOfflineNotification
                }),
                rowNum = GroupDeviceDataservice.GetRowNums(_dbContext, extraPayload.Id, groupId)
            }; ;
        }
    }
}
