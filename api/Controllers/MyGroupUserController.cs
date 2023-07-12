using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;
using Homo.AuthApi;
using Homo.Api;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/groups/{groupId}")]
    [IotDashboardAuthorizeFactory()]
    public class MyGroupUserController : ControllerBase
    {
        private readonly DBContext _dbContext;
        public MyGroupUserController(DBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 取得使用者",
            Description = ""
        )]
        [Route("users")]
        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long groupId, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return RelationOfGroupAndUserDataservice.GetAllByGroupId(_dbContext, extraPayload.Id, groupId, null);
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 批次刪除使用者",
            Description = ""
        )]
        [Route("users")]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            RelationOfGroupAndUserDataservice.BatchDelete(_dbContext, extraPayload.Id, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
