using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Core.Constants;
using Homo.Core.Helpers;
using Homo.Api;
using Swashbuckle.AspNetCore.Annotations;
using System.Collections.Generic;
using System.Linq;

namespace Homo.AuthApi
{
    [Route("v1/auth")]
    [SwaggerUiInvisibility]
    [AuthorizeFactory()]
    public class AuthTwoFactorController : ControllerBase
    {

        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly DBContext _dbContext;
        private readonly string _jwtKey;
        private readonly string _dashboardJwtKey;
        private readonly string _systemEmail;
        private readonly string _sendGridApiKey;
        private readonly string _websiteUrl;
        private readonly string _adminEmail;
        private readonly string _staticPath;
        private readonly string _refreshJwtKey;

        public AuthTwoFactorController(
            DBContext dbContext
            , IOptions<Homo.AuthApi.AppSettings> appSettings, Homo.Api.CommonLocalizer commonLocalizer
        )
        {
            _commonLocalizer = commonLocalizer;
            Secrets secrets = (Secrets)appSettings.Value.Secrets;
            _jwtKey = secrets.JwtKey;
            _dashboardJwtKey = secrets.DashboardJwtKey;
            _dbContext = dbContext;
            _systemEmail = appSettings.Value.Common.SystemEmail;
            _sendGridApiKey = secrets.SendGridApiKey;
            _websiteUrl = appSettings.Value.Common.WebsiteUrl;
            _adminEmail = appSettings.Value.Common.AdminEmail;
            _staticPath = appSettings.Value.Common.StaticPath;
            _refreshJwtKey = appSettings.Value.Secrets.RefreshJwtKey;
        }

        [SwaggerOperation(
            Tags = new[] { "身份驗證" },
            Summary = "寄送兩階段驗證信件",
            Description = ""
        )]
        [Route("send-two-factor-auth-mail")]
        [HttpPost]
        public async Task<dynamic> sendTwoFactorAuthMail(Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            User user = UserDataservice.GetOne(_dbContext, extraPayload.Id, true);

            if (user == null)
            {
                throw new CustomException(ERROR_CODE.USER_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }

            string verifyCode = CryptographicHelper.GetSpecificLengthRandomString(6, false, true);
            VerifyCodeDataservice.Create(_dbContext, new DTOs.VerifyCode()
            {
                Code = verifyCode,
                Email = user.Email,
                IsTwoFactorAuth = true,
                Expiration = System.DateTime.Now.AddMinutes(5)
            });

            MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.TWO_FACTOR_AUTH, _staticPath);
            template = MailTemplateHelper.ReplaceVariable(template, new
            {
                websiteUrl = _websiteUrl,
                adminEmail = _adminEmail,
                code = verifyCode,
                hello = _commonLocalizer.Get("hello"),
                mailContentTwoFactorAuthTitle = _commonLocalizer.Get("mailContentTwoFactorAuthTitle"),
                mailContentSystemAutoSendEmail = _commonLocalizer.Get("mailContentSystemAutoSendEmail")
            });

            await MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
            {
                Subject = _commonLocalizer.Get(template.Subject),
                Content = template.Content
            }, _systemEmail, user.Email, _sendGridApiKey);// 未來如果人多的時候就直接用 amazon ses 

            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "身份驗證" },
            Summary = "透過驗證碼交換 token",
            Description = ""
        )]
        [Route("exchange-dashboard-token")]
        [HttpPost]
        public ActionResult<dynamic> exhangeDashboardToken([FromBody] DTOs.VerifyCode dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            User user = UserDataservice.GetOne(_dbContext, extraPayload.Id);
            VerifyCode verifyCode = VerifyCodeDataservice.GetOneUnUsedByEmail(_dbContext, user.Email, dto.Code, true);

            if (verifyCode == null)
            {
                throw new CustomException(ERROR_CODE.VERIFY_CODE_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }
            VerifyCodeDataservice.UseVerifyCode(verifyCode, _dbContext);

            List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(_dbContext, user.Id);
            string[] roles = permissions.SelectMany(x => Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(x.Roles)).ToArray();

            string token = JWTHelper.GenerateToken(_dashboardJwtKey, 14 * 24 * 60, extraPayload, roles);
            string refreshToken = JWTHelper.GenerateToken(_refreshJwtKey, 6 * 30 * 24 * 60, extraPayload, roles);
            return new { token = token, refreshToken = refreshToken };
        }
    }
}