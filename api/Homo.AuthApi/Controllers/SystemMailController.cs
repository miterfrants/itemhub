using System;
using System.Net;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Annotations;

using Homo.Core.Constants;
using Homo.Api;
using api.Constants;
using api.Helpers;

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
            Summary = "發送問卷信件",
            Description = ""
        )]

        [Route("send-survey-email")]
        [HttpPost]
        public async Task<dynamic> sendSurveyEmail()
        {
            List<User> users = UserDataservice.GetSurveyEmail(_dbContext);
            if (users == null)
            {
                throw new CustomException(ERROR_CODE.USER_NOT_FOUND, HttpStatusCode.NotFound);
            }
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(users, Newtonsoft.Json.Formatting.Indented));
            for (int i = 0; i < users.Count; i++)
            {
                User user = users[i];

                MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.SURVEY, _staticPath);
                template = MailTemplateHelper.ReplaceVariable(template, new
                {
                    websiteUrl = _websiteUrl,
                    adminEmail = _adminEmail,
                    hello = _commonLocalizer.Get("hello"),
                    link = "https://forms.gle/Eo89nMZyhKhpASCCA",
                    mailContentSystemAutoSendEmail = _commonLocalizer.Get("mailContentSystemAutoSendEmail"),
                    mailContentSurvey = _commonLocalizer.Get("mailContentSurvey")
                });

                await MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
                {
                    Subject = _commonLocalizer.Get(template.Subject),
                    Content = template.Content
                }, _systemEmail, user.Email, _sendGridApiKey);

            }
            return new { status = CUSTOM_RESPONSE.OK };
        }

    }
}