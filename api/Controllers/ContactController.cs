using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Homo.AuthApi;
using Homo.Core.Constants;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/contact")]
    [SwaggerUiInvisibility]
    [IotAuthorizeFactory]
    [Validate]
    public class ContactController : ControllerBase
    {
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly IotDbContext _dbContext;
        private readonly string _systemEmail;
        private readonly string _adminEmail;
        private readonly string _webSiteUrl;
        private readonly string _sendGridApiKey;
        private readonly string _staticPath;
        public ContactController(IotDbContext dbContext, IOptions<AppSettings> optionAppSettings, Homo.Api.CommonLocalizer commonLocalizer)
        {
            _commonLocalizer = commonLocalizer;
            _dbContext = dbContext;
            AppSettings settings = optionAppSettings.Value;
            _systemEmail = optionAppSettings.Value.Common.SystemEmail;
            _sendGridApiKey = optionAppSettings.Value.Secrets.SendGridApiKey;
            _webSiteUrl = optionAppSettings.Value.Common.WebsiteUrl;
            _adminEmail = optionAppSettings.Value.Common.AdminEmail;
            _staticPath = optionAppSettings.Value.Common.StaticPath;
        }

        [SwaggerOperation(
            Tags = new[] { "聯絡我們" },
            Summary = "聯絡我們",
            Description = ""
        )]
        [HttpPost]
        public async Task<dynamic> sendEmailToUs([FromBody] DTOs.ContactUs dto)
        {
            MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.CONTACT_US, _staticPath);
            template = MailTemplateHelper.ReplaceVariable(template, new
            {
                webSiteUrl = _webSiteUrl,
                adminEmail = _adminEmail,
                message = dto.Content,
                mailContentContactUsDescription = _commonLocalizer.Get("mailContentContactUsDescription"),
                mailContentSystemAutoSendEmail = _commonLocalizer.Get("mailContentSystemAutoSendEmail")
            });

            await MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
            {
                Subject = _commonLocalizer.Get(template.Subject),
                Content = template.Content
            }, dto.FromMail, _systemEmail, _sendGridApiKey);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
