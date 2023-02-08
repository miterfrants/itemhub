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
    [Route("v1/my/pipelines")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyPipelineController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _adminEmail;
        public MyPipelineController(IotDbContext dbContext, Homo.Api.CommonLocalizer commonLocalizer, IOptions<AppSettings> appSettings)
        {
            _dbContext = dbContext;
            _commonLocalizer = commonLocalizer;
            _adminEmail = appSettings.Value.Common.AdminEmail;
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 取得分頁列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromQuery] int limit, [FromQuery] int page, [FromQuery] string title, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<Pipeline> records = PipelineDataservice.GetList(_dbContext, ownerId, page, limit, title);
            return new
            {
                pipelines = records,
                rowNum = PipelineDataservice.GetRowNum(_dbContext, ownerId, title)
            };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 建立新資料",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromBody] DTOs.Pipeline dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload, bool isVIP)
        {
            long ownerId = extraPayload.Id;
            long count = PipelineDataservice.GetRowNum(_dbContext, ownerId, null);
            if (!isVIP && count >= 1)
            {
                throw new CustomException(ERROR_CODE.OVER_PRICING_PLAN, System.Net.HttpStatusCode.Forbidden, new Dictionary<string, string>(){{
                    "reason", _commonLocalizer.Get("moreThanMaxNumberOfPipelineInAnyPlan", null, new Dictionary<string, string>(){{ "adminEmail", _adminEmail }})
                }});
            }
            Pipeline rewRecord = PipelineDataservice.Create(_dbContext, ownerId, dto);
            return rewRecord;
        }


        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 批次刪除",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineDataservice.BatchDelete(_dbContext, ownerId, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 取得單一Pipeline",
            Description = ""
        )]
        [HttpGet]
        [Route("{id}")]
        public ActionResult<dynamic> getOne([FromRoute] int id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            Pipeline record = PipelineDataservice.GetOne(_dbContext, ownerId, id);
            if (record == null)
            {
                throw new CustomException(Homo.AuthApi.ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }
            return record;
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 更新單一資料",
            Description = ""
        )]
        [HttpPatch]
        [Route("{id}")]
        public ActionResult<dynamic> update([FromRoute] int id, [FromBody] DTOs.Pipeline dto, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineDataservice.Update(_dbContext, ownerId, id, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "Pipeline" },
            Summary = "Pipeline - 刪除單一資料",
            Description = ""
        )]
        [HttpDelete]
        [Route("{id}")]
        public ActionResult<dynamic> delete([FromRoute] long id, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            PipelineDataservice.Delete(_dbContext, ownerId, id);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
