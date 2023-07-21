using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Homo.Core.Constants;
using Swashbuckle.AspNetCore.Annotations;
using System.Linq;
using Homo.AuthApi;

namespace Homo.IotApi
{
    [IotDashboardAuthorizeFactory]
    [Route("v1/my/dashboard-monitors")]
    [Validate]
    public class MyDashboardMonitorController : ControllerBase
    {
        private readonly IotDbContext _iotDbContext;
        private readonly DBContext _dbContext;
        public MyDashboardMonitorController(IotDbContext iotDbContext, DBContext dbContext)
        {
            _iotDbContext = iotDbContext;
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
            DashboardMonitor rewRecord = DashboardMonitorDataservice.Create(_iotDbContext, extraPayload.Id, dto);
            return rewRecord;
        }

        [SwaggerOperation(
            Tags = new[] { "監控中心" },
            Summary = "監控中心 - 取得監控",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getAll(
            [FromQuery] long? groupId, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            List<long> deviceIds = new List<long>();
            if (groupId != null)
            {
                var group = GroupDataservice.GetAll(_dbContext, new List<long> { groupId.GetValueOrDefault() }).FirstOrDefault();
                var groupDevices = GroupDeviceDataservice.GetAll(_iotDbContext, group.CreatedBy, groupId.GetValueOrDefault(), null);
                groupDevices.Select(x => x.DeviceId).ToList().ForEach(deviceId =>
                {
                    deviceIds.Add(deviceId);
                });
            }
            else
            {
                DeviceDataservice.GetAll(_iotDbContext, extraPayload.Id, null).Select(x => x.Id).ToList().ForEach(deviceId =>
                {
                    deviceIds.Add(deviceId);
                });
            }

            return DashboardMonitorDataservice.GetAll(_iotDbContext, extraPayload.Id, groupId, deviceIds);
        }

        [SwaggerOperation(
            Tags = new[] { "監控中心" },
            Summary = "監控中心 - 更新監控排序",
            Description = ""
        )]
        [HttpPatch]
        [Route("sorting")]
        public ActionResult<dynamic> updateSort([FromRoute] long id,
                    [FromBody] List<DTOs.DashboardMonitorSorting> dto,
                    Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            DashboardMonitorDataservice.UpdateSort(_iotDbContext, extraPayload.Id, dto);
            return new { status = CUSTOM_RESPONSE.OK };
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
            DashboardMonitorDataservice.Update(_iotDbContext, extraPayload.Id, id, dto);
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
            DashboardMonitorDataservice.BatchDelete(_iotDbContext, extraPayload.Id, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

    }
}
