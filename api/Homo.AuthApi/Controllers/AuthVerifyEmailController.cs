using System;
using System.Net;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Annotations;

using Homo.Core.Constants;
using Homo.Core.Helpers;
using Homo.Api;

namespace Homo.AuthApi
{
    [Route("v1/auth")]
    [SwaggerUiInvisibility]
    [Homo.Api.Validate]
    public class AuthVerifyEmailController : ControllerBase
    {
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly DBContext _dbContext;
        private readonly string _verifyPhoneJwtKey;
        private readonly string _envName;
        private readonly string _sendGridApiKey;
        private readonly string _systemEmail;
        private readonly string _websiteUrl;
        private readonly string _fbAppId;
        private readonly string _googleClientId;
        private readonly string _lineClientId;
        private readonly string _fbClientSecret;
        private readonly string _googleClientSecret;
        private readonly string _lineClientSecret;
        private readonly string _adminEmail;
        private readonly string _staticPath;
        public AuthVerifyEmailController(DBContext dbContext, IOptions<AppSettings> appSettings, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, Homo.Api.CommonLocalizer commonLocalizer)
        {
            Secrets secrets = (Secrets)appSettings.Value.Secrets;
            Common common = (Common)appSettings.Value.Common;
            _commonLocalizer = commonLocalizer;
            _verifyPhoneJwtKey = secrets.VerifyPhoneJwtKey;
            _dbContext = dbContext;
            _envName = env.EnvironmentName;
            _sendGridApiKey = secrets.SendGridApiKey;
            _systemEmail = common.SystemEmail;
            _websiteUrl = common.WebsiteUrl;
            _fbAppId = common.FbAppId;
            _googleClientId = common.GoogleClientId;
            _lineClientId = common.LineClientId;
            _fbClientSecret = secrets.FbClientSecret;
            _googleClientSecret = secrets.GoogleClientSecret;
            _lineClientSecret = secrets.LineClientSecret;
            _adminEmail = common.AdminEmail;
            _staticPath = common.StaticPath;
        }

        [SwaggerOperation(
            Tags = new[] { "註冊相關" },
            Summary = "寄送註冊驗證信",
            Description = ""
        )]
        [Route("send-verify-email")]
        [HttpPost]
        public async Task<dynamic> sendVerifyEmail([FromBody] DTOs.SendValidatedEmail dto)
        {
            string ip = NetworkHelper.GetIpFromRequest(Request);
            int countByIp = VerifyCodeDataservice.GetTodayCountByIp(_dbContext, ip);
            if (countByIp > 10)
            {
                throw new CustomException(ERROR_CODE.TOO_MANY_TIMES_TO_SEND_MAIL, HttpStatusCode.Forbidden);
            }

            int countByEmail = VerifyCodeDataservice.GetTodayCountByEmail(_dbContext, dto.Email);
            if (countByEmail > 10)
            {
                throw new CustomException(ERROR_CODE.TOO_MANY_TIMES_TO_SEND_MAIL, HttpStatusCode.Forbidden);
            }

            User user = UserDataservice.GetOneByEmail(_dbContext, dto.Email);
            List<string> duplicatedUserProvider = new List<string>();

            if ((user != null && !user.IsEarlyBird) || (user != null && user.IsEarlyBird && user.HashPhone != null))
            {
                throw new CustomException(ERROR_CODE.EMAIL_ALREADY_REGISTERED, HttpStatusCode.BadRequest, null, new Dictionary<string, dynamic>(){
                            {"duplicatedUserProvider", AuthHelper.GetDuplicatedUserType(user)}
                        });
            }

            string code = CryptographicHelper.GetSpecificLengthRandomString(6, true, true);
            VerifyCodeDataservice.Create(_dbContext, new DTOs.VerifyCode()
            {
                Email = dto.Email,
                Code = code,
                Expiration = DateTime.Now.AddSeconds(3 * 60),
                Ip = ip
            });

            MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.VERIFY_EMAIL, _staticPath);
            template = MailTemplateHelper.ReplaceVariable(template, new
            {
                websiteUrl = _websiteUrl,
                adminEmail = _adminEmail,
                code = code,
                mailContentVerifyDescription = _commonLocalizer.Get("mailContentVerifyDescription"),
                mailContentVerifyEmailTitle = _commonLocalizer.Get("mailContentVerifyEmailTitle"),
                mailContentSystemAutoSendEmail = _commonLocalizer.Get("mailContentSystemAutoSendEmail")
            });

            await MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
            {
                Subject = _commonLocalizer.Get(template.Subject),
                Content = template.Content
            }, _systemEmail, dto.Email, _sendGridApiKey);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "註冊相關" },
            Summary = "寄送早鳥註冊信件",
            Description = ""
        )]
        [Route("send-register-email-to-early-bird")]
        [HttpPost]
        public async Task<dynamic> sendRegisterEmailToEarlyBird([FromBody] DTOs.SendRegisterEmailToEarlyBird dto)
        {
            User user = UserDataservice.GetEarlyBirdByEmail(_dbContext, dto.Email);
            if (user == null)
            {
                throw new CustomException(ERROR_CODE.USER_NOT_FOUND, HttpStatusCode.NotFound);
            }
            string token = JWTHelper.GenerateToken(_verifyPhoneJwtKey, 60 * 24 * 7, new { Id = user.Id, Email = user.Email, IsEarlyBird = true }, null);

            DateTime expirationTime = DateTime.Now.ToUniversalTime().AddMinutes(60 * 24 * 7);
            MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.EARLY_BIRD_REGISTER, _staticPath);
            template = MailTemplateHelper.ReplaceVariable(template, new
            {
                websiteUrl = _websiteUrl,
                adminEmail = _adminEmail,
                link = $"{_websiteUrl}/auth/sign-up/?verifyPhoneToken={token}",
                hello = _commonLocalizer.Get("hello"),
                limitDate = expirationTime,
                mailContentEarlyBirdRegisterDescription = _commonLocalizer.Get("mailContentEarlyBirdRegisterDescription"),
                mailContentEarlyBirdRegisterDescription2 = _commonLocalizer.Get("mailContentEarlyBirdRegisterDescription2"),
                mailContentEarlyBirdRegisterBtn = _commonLocalizer.Get("mailContentEarlyBirdRegisterBtn"),
                mailContentSystemAutoSendEmail = _commonLocalizer.Get("mailContentSystemAutoSendEmail")
            });

            await MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
            {
                Subject = _commonLocalizer.Get(template.Subject),
                Content = template.Content
            }, _systemEmail, user.Email, _sendGridApiKey);

            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "註冊相關" },
            Summary = "驗證 Email",
            Description = ""
        )]
        [Route("verify-email")]
        [HttpPost]
        public dynamic verifyEmail([FromBody] DTOs.VerifyEmail dto)
        {
            User user = UserDataservice.GetOneByEmail(_dbContext, dto.Email);

            bool isEarlyBird = user != null && user.IsEarlyBird;

            if (user != null && !user.IsEarlyBird)
            {
                throw new CustomException(ERROR_CODE.DUPLICATE_EMAIL, HttpStatusCode.BadRequest);
            }

            VerifyCode record = VerifyCodeDataservice.GetOneUnUsedByEmail(_dbContext, dto.Email, dto.Code);
            if (record == null)
            {
                throw new CustomException(ERROR_CODE.VERIFY_CODE_NOT_FOUND, HttpStatusCode.NotFound);
            }
            record.IsUsed = true;
            _dbContext.SaveChanges();

            return new { token = JWTHelper.GenerateToken(_verifyPhoneJwtKey, 5, new { Id = record.Id, Email = record.Email, IsEarlyBird = isEarlyBird }, null) };
        }

        [SwaggerOperation(
            Tags = new[] { "註冊相關" },
            Summary = "透過社群驗證 Email",
            Description = ""
        )]
        [Route("verify-email-with-social-media")]
        [HttpPost]
        public async Task<dynamic> verifyEmailWithSocialMedia([FromBody] DTOs.AuthWithSocialMedia dto)
        {
            oAuthResp authResp = null;
            UserInfo userInfo = null;
            User user = null;
            SocialMediaProvider? provider = null;

            try
            {
                if (dto.Provider == SocialMediaProvider.FACEBOOK)
                {
                    authResp = await FacebookOAuthHelper.GetAccessToken(_fbAppId, dto.RedirectUri, _fbClientSecret, dto.Code);
                    userInfo = await FacebookOAuthHelper.GetUserInfo(authResp.access_token);
                    provider = SocialMediaProvider.FACEBOOK;
                }
                else if (dto.Provider == SocialMediaProvider.GOOGLE)
                {
                    authResp = await GoogleOAuthHelper.GetAccessToken(_googleClientId, dto.RedirectUri, _googleClientSecret, dto.Code);
                    userInfo = await GoogleOAuthHelper.GetUserInfo(authResp.access_token);
                    provider = SocialMediaProvider.GOOGLE;
                }
                else if (dto.Provider == SocialMediaProvider.LINE)
                {
                    authResp = await LineOAuthHelper.GetAccessToken(_lineClientId, dto.RedirectUri, _lineClientSecret, dto.Code);
                    userInfo = LineOAuthHelper.GetUserInfo(authResp.id_token);
                    provider = SocialMediaProvider.LINE;
                }
                user = UserDataservice.GetOneBySocialMediaSub(_dbContext, provider.GetValueOrDefault(), userInfo.sub);
            }
            catch (System.Exception)
            {
                throw new CustomException(ERROR_CODE.INVALID_CODE_FROM_SOCIAL_MEDIA, HttpStatusCode.BadRequest);
            }

            if (user != null)
            {
                throw new CustomException(ERROR_CODE.SIGN_IN_BY_OTHER_WAY, HttpStatusCode.BadRequest, null, new Dictionary<string, dynamic>(){
                            {"duplicatedUserProvider", AuthHelper.GetDuplicatedUserType(user)}
                        });
            }

            if (userInfo.email == null)
            {
                throw new CustomException(ERROR_CODE.WITHOUT_PERMISSION_TO_GET_EMAIL, HttpStatusCode.BadRequest, null);
            }

            List<string> duplicatedUserProvider = new List<string>();
            user = UserDataservice.GetOneByEmail(_dbContext, userInfo.email);
            if (user != null)
            {
                throw new CustomException(ERROR_CODE.SIGN_IN_BY_OTHER_WAY, HttpStatusCode.BadRequest, null, new Dictionary<string, dynamic>(){
                            {"duplicatedUserProvider", AuthHelper.GetDuplicatedUserType(user)}
                        });
            }
            string token = "";
            if (dto.Provider == SocialMediaProvider.FACEBOOK)
            {
                token = JWTHelper.GenerateToken(_verifyPhoneJwtKey, 5, new DTOs.JwtExtraPayload { Email = userInfo.email, FacebookSub = userInfo.sub, FirstName = userInfo.name, LastName = userInfo.name, Profile = userInfo.picture }, null);
            }
            else if (dto.Provider == SocialMediaProvider.GOOGLE)
            {
                token = JWTHelper.GenerateToken(_verifyPhoneJwtKey, 5, new DTOs.JwtExtraPayload { Email = userInfo.email, GoogleSub = userInfo.sub, FirstName = userInfo.name, LastName = userInfo.name, Profile = userInfo.picture }, null);
            }
            else if (dto.Provider == SocialMediaProvider.LINE)
            {
                token = JWTHelper.GenerateToken(_verifyPhoneJwtKey, 5, new DTOs.JwtExtraPayload { Email = userInfo.email, LineSub = userInfo.sub, FirstName = userInfo.name, LastName = userInfo.name, Profile = userInfo.picture }, null);
            }
            return new { token = token };
        }
    }
}