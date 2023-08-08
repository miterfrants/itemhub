using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using Homo.Core.Constants;
using Homo.AuthApi;
using Swashbuckle.AspNetCore.Annotations;
using System.Linq;

namespace Homo.IotApi
{
    [Route("v1/my/pipelines/{pipelineId}/connectors")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyPipelineConnectorControlle : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _adminEmail;
        public MyPipelineConnectorControlle(IotDbContext dbContext, Homo.Api.CommonLocalizer commonLocalizer, IOptions<AppSettings> appSettings)
        {
            _dbContext = dbContext;
            _commonLocalizer = commonLocalizer;
            _adminEmail = appSettings.Value.Common.AdminEmail;
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 連線 - 取得某 Pipeline 所有連線",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long pipelineId, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            return PipelineConnectorDataservice.GetAll(_dbContext, ownerId, pipelineId, null);
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 連線 - 建立新資料",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromRoute] long pipelineId, [FromBody] DTOs.PipelineConnector dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload, bool isVIP)
        {
            long ownerId = extraPayload.Id;
            bool pipelineConnectorExists = PipelineConnectorDataservice.GetRowNums(_dbContext, ownerId, pipelineId, dto.DestPipelineItemId, dto.SourcePipelineItemId) >= 1;
            if (pipelineConnectorExists)
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_INFINITY_LOOP, System.Net.HttpStatusCode.BadRequest);
            }
            pipelineConnectorExists = PipelineConnectorDataservice.GetRowNums(_dbContext, ownerId, pipelineId, dto.SourcePipelineItemId, dto.DestPipelineItemId) >= 1;
            if (pipelineConnectorExists)
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_CONNECTOR_EXISTS, System.Net.HttpStatusCode.BadRequest);
            }
            PipelineConnector rewRecord = PipelineConnectorDataservice.Create(_dbContext, ownerId, dto);
            return rewRecord;
        }


        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 連線 - 批次刪除",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromRoute] long pipelineId, [FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineConnectorDataservice.BatchDelete(_dbContext, ownerId, ownerId, pipelineId, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 連線 - 取得單一資料",
            Description = ""
        )]
        [HttpGet]
        [Route("{id}")]
        public ActionResult<dynamic> getOne([FromRoute] int pipelineId, [FromRoute] int id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineConnector record = PipelineConnectorDataservice.GetOne(_dbContext, ownerId, pipelineId, id);
            if (record == null)
            {
                throw new CustomException(Homo.AuthApi.ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }
            return record;
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 連線 - 更新單一資料",
            Description = ""
        )]
        [HttpPatch]
        [Route("{id}")]
        public ActionResult<dynamic> update([FromRoute] long pipelineId, [FromRoute] long id, [FromBody] DTOs.PipelineConnector dto, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineConnectorDataservice.Update(_dbContext, ownerId, ownerId, pipelineId, id, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline 連線 - 刪除單一資料",
            Description = ""
        )]
        [HttpDelete]
        [Route("{id}")]
        public ActionResult<dynamic> delete([FromRoute] long pipelineId, [FromRoute] long id, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineConnectorDataservice.Delete(_dbContext, ownerId, ownerId, pipelineId, id);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
