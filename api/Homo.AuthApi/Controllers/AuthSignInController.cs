using System.Net;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Core.Constants;
using Homo.Api;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.AuthApi
{
    [Route("v1/auth")]
    [SwaggerUiInvisibility]
    public class AuthSignInController : ControllerBase
    {

        private readonly DBContext _dbContext;
        private readonly string _jwtKey;
        private readonly CommonLocalizer _commonLocalizer;
        private readonly int _jwtExpirationMonth;
        private readonly bool _authByCookie;
        private readonly string _fbAppId;
        private readonly string _googleClientId;
        private readonly string _lineClientId;
        private readonly string _fbClientSecret;
        private readonly string _googleClientSecret;
        private readonly string _lineClientSecret;
        private readonly string _refreshJwtKey;
        public AuthSignInController(
            DBContext dbContext
            , CommonLocalizer localizer
            , IOptions<Homo.AuthApi.AppSettings> appSettings)
        {
            Secrets secrets = (Secrets)appSettings.Value.Secrets;
            Common common = (Common)appSettings.Value.Common;
            _commonLocalizer = localizer;
            _jwtKey = secrets.JwtKey;
            _dbContext = dbContext;
            _jwtExpirationMonth = common.JwtExpirationMonth;
            _fbAppId = common.FbAppId;
            _fbClientSecret = secrets.FbClientSecret;
            _googleClientId = common.GoogleClientId;
            _googleClientSecret = secrets.GoogleClientSecret;
            _lineClientId = common.LineClientId;
            _lineClientSecret = secrets.LineClientSecret;
            _authByCookie = common.AuthByCookie;
            _refreshJwtKey = secrets.RefreshJwtKey;
        }

        [SwaggerOperation(
            Tags = new[] { "身份驗證" },
            Summary = "登出",
            Description = ""
        )]
        [Route("sign-out")]
        [HttpPost]
        public ActionResult<dynamic> signOut()
        {
            Response.Cookies.Delete("token");
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "身份驗證" },
            Summary = "使用 Email 登入",
            Description = ""
        )]
        [Route("sign-in-with-email")]
        [HttpPost]
        [Validate]
        public dynamic signInWithEmail([FromBody] DTOs.SignInWithEmail dto)
        {
            User user = UserDataservice.GetOneByEmail(_dbContext, dto.Email);

            if (user == null)
            {
                throw new CustomException(ERROR_CODE.USER_NOT_FOUND, HttpStatusCode.NotFound);
            }

            if (user.Salt == null || user.Salt == "")
            {
                throw new CustomException(ERROR_CODE.SIGN_IN_BY_OTHER_WAY, HttpStatusCode.BadRequest, null, new Dictionary<string, dynamic>(){
                        {"duplicatedUserProviders", AuthHelper.GetDuplicatedUserType(user)}
                    });
            }
            if (user.HashPhone == null)
            {
                throw new CustomException(ERROR_CODE.LACK_PHONE, HttpStatusCode.Forbidden);
            }

            if (user.Hash != Homo.Core.Helpers.CryptographicHelper.GenerateSaltedHash(dto.Password, user.Salt))
            {
                throw new CustomException(ERROR_CODE.SIGNIN_FAILED, HttpStatusCode.Forbidden);
            }

            if (!user.Status)
            {
                throw new CustomException(ERROR_CODE.USER_BE_BLOCKED, HttpStatusCode.Forbidden);
            }

            var extraPayload = new DTOs.JwtExtraPayload()
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                County = user.County,
                City = user.City,
                FacebookSub = user.FacebookSub,
                GoogleSub = user.GoogleSub,
                LineSub = user.LineSub,
                Profile = user.Profile,
                PseudonymousPhone = user.PseudonymousPhone,
                PseudonymousAddress = user.PseudonymousAddress,
                IsOverSubscriptionPlan = user.IsOverSubscriptionPlan
            };

            List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(_dbContext, user.Id);
            string[] roles = permissions.SelectMany(x => Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(x.Roles)).ToArray();

            string token = JWTHelper.GenerateToken(_jwtKey, _jwtExpirationMonth * 30 * 24 * 60, extraPayload, roles);
            string refreshToken = JWTHelper.GenerateToken(_refreshJwtKey, 6 * 30 * 24 * 60, extraPayload, roles);
            if (_authByCookie)
            {
                Response.Cookies.Append("token", token, AuthHelper.GetSecureCookieOptions());
                Response.Cookies.Append("refreshToken", refreshToken, AuthHelper.GetSecureCookieOptions());

                return new
                {
                    status = CUSTOM_RESPONSE.OK,
                };
            }
            else
            {
                return new { token = token, refreshToken = refreshToken };
            }

        }

        [SwaggerOperation(
            Tags = new[] { "身份驗證" },
            Summary = "使用社群媒體登入",
            Description = ""
        )]
        [Route("sign-in-with-social-media")]
        [HttpPost]
        public async Task<dynamic> signInWithSocialMedia([FromBody] DTOs.AuthWithSocialMedia dto)
        {
            oAuthResp authResp = null;
            UserInfo userInfo = null;
            if (dto.Provider == SocialMediaProvider.FACEBOOK)
            {
                authResp = await FacebookOAuthHelper.GetAccessToken(_fbAppId, dto.RedirectUri, _fbClientSecret, dto.Code);
                userInfo = await FacebookOAuthHelper.GetUserInfo(authResp.access_token);
            }
            else if (dto.Provider == SocialMediaProvider.LINE)
            {
                authResp = await LineOAuthHelper.GetAccessToken(_lineClientId, dto.RedirectUri, _lineClientSecret, dto.Code);
                userInfo = LineOAuthHelper.GetUserInfo(authResp.id_token);
            }
            else if (dto.Provider == SocialMediaProvider.GOOGLE)
            {
                authResp = await GoogleOAuthHelper.GetAccessToken(_googleClientId, dto.RedirectUri, _googleClientSecret, dto.Code);
                userInfo = await GoogleOAuthHelper.GetUserInfo(authResp.access_token);
            }

            if (userInfo.sub == null)
            {
                throw new CustomException(ERROR_CODE.INVALID_CODE_FROM_SOCIAL_MEDIA, HttpStatusCode.BadRequest);
            }

            User user = UserDataservice.GetOneBySocialMediaSub(_dbContext, dto.Provider, userInfo.sub);
            if (user == null)
            {
                user = UserDataservice.GetOneByEmail(_dbContext, userInfo.email);
                if (user != null)
                {
                    throw new CustomException(ERROR_CODE.SIGN_IN_BY_OTHER_WAY, HttpStatusCode.BadRequest, null, new Dictionary<string, dynamic>(){
                        {"duplicatedUserProvider", AuthHelper.GetDuplicatedUserType(user)}
                    });
                }
                throw new CustomException(ERROR_CODE.USER_NOT_FOUND, HttpStatusCode.NotFound);
            }

            if (!user.Status)
            {
                throw new CustomException(ERROR_CODE.USER_BE_BLOCKED, HttpStatusCode.Forbidden);
            }

            var extraPayload = new
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                County = user.County,
                City = user.City,
                FacebookSub = user.FacebookSub,
                GoogleSub = user.GoogleSub,
                LineSub = user.LineSub,
                Profile = user.Profile,
                PseudonymousPhone = user.PseudonymousPhone,
                PseudonymousAddress = user.PseudonymousAddress,
                IsOverSubscriptionPlan = user.IsOverSubscriptionPlan
            };

            List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(_dbContext, user.Id);
            string[] roles = permissions.SelectMany(x => Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(x.Roles)).ToArray();

            string token = JWTHelper.GenerateToken(_jwtKey, _jwtExpirationMonth * 30 * 24 * 60, extraPayload, roles);
            string refreshToken = JWTHelper.GenerateToken(_refreshJwtKey, 6 * 30 * 24 * 60, extraPayload, roles);
            if (_authByCookie)
            {
                Response.Cookies.Append("token", token, AuthHelper.GetSecureCookieOptions());
                Response.Cookies.Append("refreshToken", refreshToken, AuthHelper.GetSecureCookieOptions());
                return new
                {
                    status = CUSTOM_RESPONSE.OK,
                };
            }
            else
            {
                return new { token = token, refreshToken = refreshToken };
            }
        }

    }
}