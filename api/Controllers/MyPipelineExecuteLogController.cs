using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using Swashbuckle.AspNetCore.Annotations;
using System;

namespace Homo.IotApi
{
    [Route("v1/my/pipelines/{id}/execute-logs")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyPipelineExecuteLogController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        public MyPipelineExecuteLogController(IotDbContext dbContext, Homo.Api.CommonLocalizer commonLocalizer, IOptions<AppSettings> appSettings)
        {
            _dbContext = dbContext;
            _commonLocalizer = commonLocalizer;
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 執行紀錄 - 取得分頁列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromRoute] long id, [FromQuery] int limit, [FromQuery] int page, [FromQuery] DateTime? startAt, [FromQuery] DateTime? endAt, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            var records = PipelineExecuteLogDataservice.GetList(_dbContext, ownerId, id, null, startAt, endAt);
            return new
            {
                pipelineExecuteLogs = records,
                rowNum = PipelineExecuteLogDataservice.GetCount(_dbContext, ownerId, id, null, startAt, endAt)
            };
        }

    }
}
