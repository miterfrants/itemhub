using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Annotations;
using System.Collections.Generic;
using Homo.Core.Constants;
using Homo.Api;
using Newtonsoft.Json;

namespace Homo.AuthApi
{
    [Route("v1/system-mail")]
    [SwaggerUiInvisibility]
    [AuthorizeFactory]
    public class SystemMailController : ControllerBase
    {
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly DBContext _dbContext;
        private readonly string _envName;
        private readonly string _sendGridApiKey;
        private readonly string _systemEmail;
        private readonly string _websiteUrl;
        private readonly string _adminEmail;
        private readonly string _staticPath;
        public SystemMailController(DBContext dbContext, IOptions<AppSettings> appSettings, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, Homo.Api.CommonLocalizer commonLocalizer)
        {
            Secrets secrets = (Secrets)appSettings.Value.Secrets;
            Common common = (Common)appSettings.Value.Common;
            _commonLocalizer = commonLocalizer;
            _dbContext = dbContext;
            _envName = env.EnvironmentName;
            _sendGridApiKey = secrets.SendGridApiKey;
            _systemEmail = common.SystemEmail;
            _websiteUrl = common.WebsiteUrl;
            _adminEmail = common.AdminEmail;
            _staticPath = common.StaticPath;
        }

        [SwaggerOperation(
            Tags = new[] { "系統信" },
            Summary = "發送客製信件",
            Description = ""
        )]

        [Route("custom-email")]
        [HttpPost]
        public async Task<dynamic> sendCustomEmail([FromBody] DTOs.CustomEmail dto, DTOs.JwtExtraPayload extraPayload)
        {
            User admin = UserDataservice.GetOne(_dbContext, extraPayload.Id, true);
            if (admin == null || !admin.IsManager.GetValueOrDefault())
            {
                throw new CustomException(ERROR_CODE.UNAUTH_ACCESS_API, HttpStatusCode.NotFound);
            }

            User user = null;
            if (dto.IsUser)
            {
                user = UserDataservice.GetSurveyEmail(_dbContext, dto.Email);
            }

            if (dto.IsUser && user == null)
            {
                throw new CustomException(ERROR_CODE.USER_NOT_FOUND, HttpStatusCode.NotFound);
            }

            ConvertHelper.EnumList targetTemplate = ConvertHelper.EnumToList(typeof(MAIL_TEMPLATE)).Find(x => x.Key == dto.TemplateName);

            if (targetTemplate == null)
            {
                throw new CustomException(ERROR_CODE.MAIL_TEMPLATE_NOT_FOUND, HttpStatusCode.NotFound);
            }

            MailTemplate template = MailTemplateHelper.Get((MAIL_TEMPLATE)targetTemplate.Value, _staticPath);

            template = MailTemplateHelper.ReplaceVariable(template, new
            {
                websiteUrl = _websiteUrl,
                adminEmail = _adminEmail,
                hello = _commonLocalizer.Get("hello"),
                mailContent = dto.Content,
                mailContentSystemAutoSendEmail = _commonLocalizer.Get("mailContentSystemAutoSendEmail"),
            });

            template = MailTemplateHelper.ReplaceVariable(template, dto.Variable);

            await MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
            {
                Subject = dto.Subject,
                Content = template.Content
            }, _systemEmail, dto.Email, _sendGridApiKey);

            return new
            {
                status = CUSTOM_RESPONSE.OK
            };
        }

    }
}