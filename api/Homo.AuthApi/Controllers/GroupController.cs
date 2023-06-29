using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;
using Homo.Api;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.AuthApi
{
    [Route("v1/groups")]
    [AuthorizeFactory(AUTH_TYPE.COMMON, new ROLE[] { ROLE.USER })]
    public class GroupController : ControllerBase
    {
        private readonly DBContext _dbContext;
        public GroupController(DBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 取得分頁列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromQuery] string name, [FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            List<Group> records = GroupDataservice.GetList(_dbContext, page, limit, name);
            return new
            {
                groups = records,
                rowNum = GroupDataservice.GetRowNum(_dbContext, name)
            };
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 取得列表",
            Description = ""
        )]
        [HttpGet]
        [Route("all")]
        public ActionResult<dynamic> getAll([FromQuery] string name)
        {
            return GroupDataservice.GetAll(_dbContext, name);
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 新增群組",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromBody] DTOs.Group dto, DTOs.JwtExtraPayload extraPayload)
        {
            long createdBy = extraPayload.Id;
            Group rewRecord = GroupDataservice.Create(_dbContext, createdBy, dto);
            return rewRecord;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 批次刪除",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromBody] List<long?> ids, DTOs.JwtExtraPayload extraPayload)
        {
            long editedBy = extraPayload.Id;
            GroupDataservice.BatchDelete(_dbContext, editedBy, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 取得單一資料",
            Description = ""
        )]
        [HttpGet]
        [Route("{id}")]
        public ActionResult<dynamic> get([FromRoute] int id)
        {
            Group record = GroupDataservice.GetOne(_dbContext, id);
            if (record == null)
            {
                throw new CustomException(ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }
            return record;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 更新單筆資料",
            Description = ""
        )]
        [HttpPatch]
        [Route("{id}")]
        public ActionResult<dynamic> update([FromRoute] int id, [FromBody] DTOs.Group dto, DTOs.JwtExtraPayload extraPayload)
        {
            long editedBy = extraPayload.Id;
            GroupDataservice.Update(_dbContext, id, editedBy, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 刪除單筆資料",
            Description = ""
        )]
        [HttpDelete]
        [Route("{id}")]
        public ActionResult<dynamic> delete([FromRoute] long id, DTOs.JwtExtraPayload extraPayload)
        {
            long editedBy = extraPayload.Id;
            GroupDataservice.Delete(_dbContext, id, editedBy);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
