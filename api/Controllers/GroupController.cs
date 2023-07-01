using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;
using Homo.AuthApi;
using Homo.Api;
using Swashbuckle.AspNetCore.Annotations;

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

            if (invitation.CreatedAt >= System.DateTime.Now.AddHours(-1))
            {
                throw new CustomException(ERROR_CODE.INVITATION_EXPIRED, System.Net.HttpStatusCode.Forbidden);
            }

            RelationOfGroupAndUserDataservice.AddPermissionGroups(extraPayload.Id, extraPayload.Id, new List<long> { id }, _dbContext);
            InvitationDataservice.DeleteWithTrack(_dbContext, invitation);

            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
