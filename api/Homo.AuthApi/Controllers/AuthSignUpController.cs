using System.Net;
using System.Collections.Generic;
using System.Linq;
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
    public class AuthSignUpController : ControllerBase
    {
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly DBContext _dbContext;
        private readonly string _jwtKey;
        private readonly string _dashboardJwtKey;
        private readonly string _signUpJwtKey;
        private readonly string _verifyPhoneJwtKey;
        private readonly int _jwtExpirationMonth;
        private readonly string _envName;
        private readonly string _sendGridAPIKey;
        private readonly string _systemEmail;
        private readonly string _fbAppId;
        private readonly string _googleClientId;
        private readonly string _lineClientId;
        private readonly string _fbClientSecret;
        private readonly string _googleClientSecret;
        private readonly string _lineClientSecret;
        private readonly bool _authByCookie;
        private readonly string _PKCS1PublicKeyPath;
        private readonly string _phoneHashSalt;
        private readonly string _refreshJwtKey;
        public AuthSignUpController(DBContext dbContext, IOptions<AppSettings> appSettings, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, Homo.Api.CommonLocalizer commonLocalizer)
        {
            Secrets secrets = (Secrets)appSettings.Value.Secrets;
            Common common = (Common)appSettings.Value.Common;
            _commonLocalizer = commonLocalizer;
            _jwtKey = secrets.JwtKey;
            _dashboardJwtKey = secrets.DashboardJwtKey;
            _jwtExpirationMonth = common.JwtExpirationMonth;
            _signUpJwtKey = secrets.SignUpJwtKey;
            _verifyPhoneJwtKey = secrets.VerifyPhoneJwtKey;
            _dbContext = dbContext;
            _envName = env.EnvironmentName;
            _sendGridAPIKey = secrets.SendGridApiKey;
            _systemEmail = common.SystemEmail;
            _fbAppId = common.FbAppId;
            _fbClientSecret = secrets.FbClientSecret;
            _googleClientId = common.GoogleClientId;
            _googleClientSecret = secrets.GoogleClientSecret;
            _lineClientId = common.LineClientId;
            _lineClientSecret = secrets.LineClientSecret;
            _authByCookie = common.AuthByCookie;
            _PKCS1PublicKeyPath = common.Pkcs1PublicKeyPath;
            _phoneHashSalt = secrets.PhoneHashSalt;
        }

        [SwaggerOperation(
            Tags = new[] { "註冊相關" },
            Summary = "註冊",
            Description = ""
        )]
        [Route("sign-up")]
        [AuthorizeFactory(AUTH_TYPE.SIGN_UP)]
        [HttpPost]
        public ActionResult<dynamic> signUp([FromBody] DTOs.SignUp dto, DTOs.JwtExtraPayload extraPayload)
        {
            User newUser = null;
            User user = null;
            SocialMediaProvider? socialMediaProvider = null;
            string sub = null;
            if (extraPayload.FacebookSub != null)
            {
                socialMediaProvider = SocialMediaProvider.FACEBOOK;
                sub = extraPayload.FacebookSub;
            }
            else if (extraPayload.GoogleSub != null)
            {
                socialMediaProvider = SocialMediaProvider.GOOGLE;
                sub = extraPayload.GoogleSub;
            }
            else if (extraPayload.LineSub != null)
            {
                socialMediaProvider = SocialMediaProvider.LINE;
                sub = extraPayload.LineSub;
            }

            if (socialMediaProvider != null)
            {
                user = UserDataservice.GetOneBySocialMediaSub(_dbContext, socialMediaProvider.GetValueOrDefault(), sub);
            }

            if (user != null)
            {
                throw new CustomException(ERROR_CODE.EMAIL_ALREADY_REGISTERED, HttpStatusCode.BadRequest, null, new Dictionary<string, dynamic>(){
                            {"duplicatedUserProvider", AuthHelper.GetDuplicatedUserType(user)}
                        });
            }

            string pseudoPhone = CryptographicHelper.GetHiddenString(extraPayload.Phone, 2, 2);
            string encryptPhone = CryptographicHelper.GetRSAEncryptResult(_PKCS1PublicKeyPath, extraPayload.Phone);
            string hashPhone = CryptographicHelper.GenerateSaltedHash(extraPayload.Phone, _phoneHashSalt);

            if (sub != null)
            {
                newUser = UserDataservice.SignUpWithSocialMedia(_dbContext, socialMediaProvider.GetValueOrDefault(), sub, extraPayload.Email, pseudoPhone, encryptPhone, hashPhone, null, extraPayload.Profile, extraPayload.FirstName, extraPayload.LastName, dto.Birthday);
            }
            else
            {
                string salt = CryptographicHelper.GetSalt(64);
                string hash = CryptographicHelper.GenerateSaltedHash(dto.Password, salt);
                newUser = UserDataservice.SignUp(_dbContext, extraPayload.Email, dto.Password, pseudoPhone, encryptPhone, hashPhone, dto.FirstName, dto.LastName, salt, hash, dto.Birthday);
            }

            var userPayload = new DTOs.JwtExtraPayload()
            {
                Id = newUser.Id,
                Email = newUser.Email,
                FirstName = newUser.FirstName,
                LastName = newUser.LastName,
                County = newUser.County,
                City = newUser.City,
                FacebookSub = newUser.FacebookSub,
                GoogleSub = newUser.GoogleSub,
                LineSub = newUser.LineSub,
                Profile = newUser.Profile,
                PseudonymousPhone = newUser.PseudonymousPhone,
                PseudonymousAddress = newUser.PseudonymousAddress,
                IsOverSubscriptionPlan = newUser.IsOverSubscriptionPlan
            };

            List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(_dbContext, newUser.Id);
            string[] roles = permissions.SelectMany(x => Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(x.Roles)).ToArray();

            string token = JWTHelper.GenerateToken(_jwtKey, _jwtExpirationMonth * 30 * 24 * 60, userPayload, roles);
            string refreshToken = JWTHelper.GenerateToken(_refreshJwtKey, 6 * 30 * 24 * 60, userPayload, roles);
            string dashboardToken = JWTHelper.GenerateToken(_dashboardJwtKey, 3 * 24 * 60, userPayload, roles);
            string dashboardRefreshToken = JWTHelper.GenerateToken(_refreshJwtKey, 6 * 30 * 24 * 60, userPayload, roles);
            if (_authByCookie)
            {
                Response.Cookies.Append("token", token, AuthHelper.GetSecureCookieOptions());
                Response.Cookies.Append("refreshToken", refreshToken, AuthHelper.GetSecureCookieOptions());
                Response.Cookies.Append("dashboardToken", dashboardToken, AuthHelper.GetSecureCookieOptions());
                Response.Cookies.Append("dashboardRefreshToken", dashboardRefreshToken, AuthHelper.GetSecureCookieOptions());
            }
            else
            {
                return new
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    DashboardToken = dashboardToken,
                    DashboardRefreshToken = dashboardRefreshToken,
                };
            }

            return userPayload;
        }

    }
}