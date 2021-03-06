using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Homo.Core.Constants;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [IotDashboardAuthorizeFactory]
    [Route("v1/my/dashboard-monitors")]
    [Validate]
    public class MyDashboardMonitorController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        public MyDashboardMonitorController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "監控中心" },
            Summary = "監控中心 - 建立新的監控",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromBody] DTOs.DashboardMonitor dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            DashboardMonitor rewRecord = DashboardMonitorDataservice.Create(_dbContext, extraPayload.Id, dto);
            return rewRecord;
        }

        [SwaggerOperation(
            Tags = new[] { "監控中心" },
            Summary = "監控中心 - 取得監控",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getAll(
            Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return DashboardMonitorDataservice.GetAll(_dbContext, extraPayload.Id);
        }

        [SwaggerOperation(
            Tags = new[] { "監控中心" },
            Summary = "監控中心 - 更新單一監控資料",
            Description = ""
        )]
        [HttpPatch]
        [Route("{id}")]
        public ActionResult<dynamic> update([FromRoute] long id,
            [FromBody] DTOs.DashboardMonitor dto,
            Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            DashboardMonitorDataservice.Update(_dbContext, extraPayload.Id, id, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "監控中心" },
            Summary = "監控中心 - 刪除多筆監控資料",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            DashboardMonitorDataservice.BatchDelete(_dbContext, extraPayload.Id, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

    }
}
