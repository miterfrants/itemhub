using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;
using Homo.AuthApi;
using Swashbuckle.AspNetCore.Annotations;
using System.Linq;

namespace Homo.IotApi
{
    [Route("v1/groups")]
    [IotDashboardAuthorizeFactory()]
    public class GroupController : ControllerBase
    {
        private readonly DBContext _dbContext;
        public GroupController(DBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 取得群組名稱",
            Description = ""
        )]
        [HttpGet]
        [Route("name")]
        public ActionResult<dynamic> getNames([FromQuery] List<long> groupIds, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return GroupDataservice.GetAll(_dbContext, groupIds).Select(x => new { Name = x.Name, Id = x.Id }).ToList();
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組 - 加入",
            Description = ""
        )]
        [Route("{id}/invitations/{invitationId}/join")]
        [HttpPost]
        public ActionResult<dynamic> join([FromRoute] long id, [FromRoute] long invitationId, [FromBody] Homo.AuthApi.DTOs.JoinGroup dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            var invitation = InvitationDataservice.GetAvaiableOne(_dbContext, id, invitationId, dto.Token);
            if (invitation == null)
            {
                throw new CustomException(ERROR_CODE.INVITATION_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }

            if ((System.DateTime.Now - invitation.CreatedAt).TotalHours >= 1)
            {
                throw new CustomException(ERROR_CODE.INVITATION_EXPIRED, System.Net.HttpStatusCode.Forbidden);
            }

            RelationOfGroupAndUserDataservice.Add(invitation.CreatedBy, extraPayload.Id, new List<long> { id }, _dbContext);
            InvitationDataservice.DeleteWithTrack(_dbContext, invitation);

            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
