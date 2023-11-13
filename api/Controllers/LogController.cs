using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using Homo.Core.Constants;
using Homo.AuthApi;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/log")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class LogController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        public LogController(IotDbContext dbContext, IOptions<AppSettings> appSettings, Homo.Api.CommonLocalizer commonLocalizer)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - Log",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromBody] DTOs.Log dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            LogDataservice.Create(_dbContext, dto);
            return new { status = "OK" };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "Pipeline - Log",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> GetPipelineLogs([FromQuery] long pipelineId, [FromQuery] int page, [FromQuery] int limit, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            return new
            {
                logs = LogDataservice.GetList(_dbContext, ownerId, pipelineId, page, limit),
                rowNum = LogDataservice.GetRowNum(_dbContext, ownerId, pipelineId)
            };
        }

    }
}
