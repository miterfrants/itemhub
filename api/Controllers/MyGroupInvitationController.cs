using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;
using Homo.AuthApi;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.Extensions.Options;

namespace Homo.IotApi
{
    [Route("v1/my/groups/{id}/invitations")]
    [IotDashboardAuthorizeFactory]
    public class MyGroupInvitationController : ControllerBase
    {
        private readonly DBContext _dbContext;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _sendGridAPIKey;
        private readonly string _systemEmail;
        private readonly string _websiteUrl;
        private readonly string _staticPath;
        private readonly string _adminEmail;
        public MyGroupInvitationController(DBContext dbContext, IOptions<AppSettings> appSettings, Homo.Api.CommonLocalizer commonLocalizer)
        {
            _dbContext = dbContext;
            var secrets = appSettings.Value.Secrets;
            var common = appSettings.Value.Common;
            _sendGridAPIKey = secrets.SendGridApiKey;
            _systemEmail = common.SystemEmail;
            _websiteUrl = common.WebsiteUrl;
            _commonLocalizer = commonLocalizer;
            _adminEmail = common.AdminEmail;
            _staticPath = common.StaticPath;
        }


        [SwaggerOperation(
                    Tags = new[] { "權限管理系統" },
                    Summary = "群組使用者 - 取得邀請的使用者",
                    Description = ""
                )]
        [HttpGet]
        public ActionResult<dynamic> getAll([FromRoute] long id, [FromBody] List<string> emails, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long userId = extraPayload.Id;
            return InvitationDataservice.GetAll(_dbContext, userId, id);
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組使用者 - 邀請使用者",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> invite([FromRoute] long id, [FromBody] List<string> emails, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long userId = extraPayload.Id;
            var results = InvitationDataservice.BatchCreate(_dbContext, userId, id, emails);
            var group = MyGroupDataservice.GetOne(_dbContext, userId, id);

            results.ForEach(invitation =>
            {
                MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.INVITE_TO_JOIN_GROUP, _staticPath);
                template = MailTemplateHelper.ReplaceVariable(template, new
                {
                    webSiteUrl = _websiteUrl,
                    firstName = extraPayload.FirstName,
                    groupName = group.Name,
                    token = invitation.Token,
                    mailContentSystemAutoSendEmail = _commonLocalizer.Get("mailContentSystemAutoSendEmail"),
                    adminEmail = _adminEmail
                });
                template.Subject = _commonLocalizer.Get(template.Subject);
                // MailHelper.Send(MailProvider.SEND_GRID, template, _systemEmail, invitation.Email, _sendGridAPIKey);
            });

            return results;
        }

        [SwaggerOperation(
            Tags = new[] { "權限管理系統" },
            Summary = "群組使用者 - 刪除邀請",
            Description = ""
        )]
        [HttpDelete]
        [Route("{invitationId}")]
        public ActionResult<dynamic> delete([FromRoute] long id, [FromBody] long invitationId, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long userId = extraPayload.Id;
            InvitationDataservice.BatchDelete(_dbContext, userId, id, new List<long> { invitationId });
            return new { status = CUSTOM_RESPONSE.OK };
        }

    }
}
