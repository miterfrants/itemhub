using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;
using Homo.AuthApi;
using Homo.Api;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/groups")]
    [IotDashboardAuthorizeFactory()]
    public class MyGroupController : ControllerBase
    {
        private readonly DBContext _dbContext;
        public MyGroupController(DBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 取得分頁列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromQuery] string name, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload, [FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            List<Group> records = MyGroupDataservice.GetList(_dbContext, page, limit, extraPayload.Id, name);
            return new
            {
                groups = records,
                rowNum = MyGroupDataservice.GetRowNum(_dbContext, extraPayload.Id, name)
            };
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 取得列表",
            Description = ""
        )]
        [HttpGet]
        [Route("all")]
        public ActionResult<dynamic> getAll([FromQuery] string name, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return MyGroupDataservice.GetAll(_dbContext, extraPayload.Id, name);
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 新增群組",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromBody] Homo.AuthApi.DTOs.Group dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long createdBy = extraPayload.Id;
            Group rewRecord = MyGroupDataservice.Create(_dbContext, createdBy, dto);
            return rewRecord;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 批次刪除",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromBody] List<long?> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long userId = extraPayload.Id;
            MyGroupDataservice.BatchDelete(_dbContext, userId, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 取得單一資料",
            Description = ""
        )]
        [HttpGet]
        [Route("{id}")]
        public ActionResult<dynamic> get([FromRoute] int id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            Group record = MyGroupDataservice.GetOne(_dbContext, extraPayload.Id, id);
            if (record == null)
            {
                throw new CustomException(Homo.AuthApi.ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
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
        public ActionResult<dynamic> update([FromRoute] int id, [FromBody] Homo.AuthApi.DTOs.Group dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long editedBy = extraPayload.Id;
            MyGroupDataservice.Update(_dbContext, id, editedBy, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 刪除單筆資料",
            Description = ""
        )]
        [HttpDelete]
        [Route("{id}")]
        public ActionResult<dynamic> delete([FromRoute] long id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long editedBy = extraPayload.Id;
            MyGroupDataservice.Delete(_dbContext, id, editedBy);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
