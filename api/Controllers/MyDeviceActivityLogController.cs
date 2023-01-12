using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using System.Linq;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/last-device-activity-logs")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyLastDeviceActivityLogsController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly string _dbConnectionString;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _adminEmail;
        public MyLastDeviceActivityLogsController(IotDbContext dbContext, IOptions<AppSettings> appSettings, Homo.Api.CommonLocalizer commonLocalizer)
        {
            _dbContext = dbContext;
            _dbConnectionString = appSettings.Value.Secrets.DBConnectionString;
            _commonLocalizer = commonLocalizer;
            _adminEmail = appSettings.Value.Common.AdminEmail;

        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置最後上線時間",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromQuery] string deviceIds, [FromQuery] int limit, [FromQuery] int page, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<long> listDeviceIds = new List<long>();
            deviceIds.Split(",").ToList<string>().ForEach(item =>
            {
                long test = -1;
                long.TryParse(item, out test);
                if (test != -1)
                {
                    listDeviceIds.Add(test);
                }
            });
            return DeviceActivityLogDataservice.GetLastActivityLogs(_dbContext, ownerId, listDeviceIds);
        }

    }
}
