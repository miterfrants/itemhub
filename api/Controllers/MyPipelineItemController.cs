using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using Homo.Core.Constants;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/pipelines/{pipelineId}/items")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyPipelineItemController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _adminEmail;
        public MyPipelineItemController(IotDbContext dbContext, Homo.Api.CommonLocalizer commonLocalizer, IOptions<AppSettings> appSettings)
        {
            _dbContext = dbContext;
            _commonLocalizer = commonLocalizer;
            _adminEmail = appSettings.Value.Common.AdminEmail;
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 單元 - 取得某 Pipeline 所有單元",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long pipelineId, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            return PipelineItemDataservice.GetAll(_dbContext, ownerId, pipelineId, null);
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 單元 - 建立新資料",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromRoute] long pipelineId, [FromBody] DTOs.PipelineItem dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload, bool isVIP)
        {
            long ownerId = extraPayload.Id;
            int count = PipelineItemDataservice.GetRowNums(_dbContext, ownerId, pipelineId);
            if (!isVIP && count >= 10)
            {
                throw new CustomException(ERROR_CODE.OVER_PRICING_PLAN, System.Net.HttpStatusCode.Forbidden, new Dictionary<string, string>(){{
                    "reason", _commonLocalizer.Get("moreThanMaxNumberOfPipelineItemInAnyPlan", null, new Dictionary<string, string>(){{ "adminEmail", _adminEmail }})
                }});
            }
            PipelineItem rewRecord = PipelineItemDataservice.Create(_dbContext, ownerId, dto);
            return rewRecord;
        }


        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 單元 - 批次刪除",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromRoute] long pipelineId, [FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineItemDataservice.BatchDelete(_dbContext, ownerId, ownerId, pipelineId, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 單元 - 取得單一資料",
            Description = ""
        )]
        [HttpGet]
        [Route("{id}")]
        public ActionResult<dynamic> getOne([FromRoute] int pipelineId, [FromRoute] int id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineItem record = PipelineItemDataservice.GetOne(_dbContext, ownerId, pipelineId, id);
            if (record == null)
            {
                throw new CustomException(Homo.AuthApi.ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }
            return record;
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 單元 - 更新單一資料",
            Description = ""
        )]
        [HttpPatch]
        [Route("{id}")]
        public ActionResult<dynamic> update([FromRoute] long pipelineId, [FromRoute] long id, [FromBody] DTOs.PipelineItem dto, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineItemDataservice.Update(_dbContext, ownerId, ownerId, pipelineId, id, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 單元 - 刪除單一資料",
            Description = ""
        )]
        [HttpDelete]
        [Route("{id}")]
        public ActionResult<dynamic> delete([FromRoute] long pipelineId, [FromRoute] long id, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineItemDataservice.Delete(_dbContext, ownerId, ownerId, pipelineId, id);
            PipelineConnectorDataservice.BatchDeleteByItemIds(_dbContext, ownerId, ownerId, pipelineId, new List<long>() { id });
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
