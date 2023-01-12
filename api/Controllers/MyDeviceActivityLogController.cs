using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using Homo.Core.Constants;
using Homo.AuthApi;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/devices/:id/activity-logs")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyDeviceActivityLogController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly string _dbConnectionString;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _adminEmail;
        public MyDeviceActivityLogController(IotDbContext dbContext, IOptions<AppSettings> appSettings, Homo.Api.CommonLocalizer commonLocalizer)
        {
            _dbContext = dbContext;
            _dbConnectionString = appSettings.Value.Secrets.DBConnectionString;
            _commonLocalizer = commonLocalizer;
            _adminEmail = appSettings.Value.Common.AdminEmail;

        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置上線時間 - 取得分頁列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromRoute] long id, [FromQuery] int limit, [FromQuery] int page, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<DeviceActivityLog> records = DeviceActivityLogDataservice.GetList(_dbContext, ownerId, id, page, limit);

            return new
            {
                logs = records,
                rowNum = DeviceActivityLogDataservice.GetRowNum(_dbContext, ownerId, id)
            };
        }

    }
}
