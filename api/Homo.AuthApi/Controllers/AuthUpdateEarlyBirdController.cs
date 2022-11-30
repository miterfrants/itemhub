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
    public class AuthRegisterForEarlyBirdController : ControllerBase
    {
        private readonly DBContext _dbContext;
        private readonly string _jwtKey;
        private readonly string _dashboardJwtKey;
        private readonly int _jwtExpirationMonth;
        private readonly bool _authByCookie;
        private readonly string _PKCS1PublicKeyPath;
        private readonly string _phoneHashSalt;
        private readonly string _refreshJwtKey;
        public AuthRegisterForEarlyBirdController(DBContext dbContext, IOptions<AppSettings> appSettings, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, Homo.Api.CommonLocalizer commonLocalizer)
        {
            Secrets secrets = (Secrets)appSettings.Value.Secrets;
            Common common = (Common)appSettings.Value.Common;
            _jwtKey = secrets.JwtKey;
            _dashboardJwtKey = secrets.DashboardJwtKey;
            _jwtExpirationMonth = common.JwtExpirationMonth;
            _dbContext = dbContext;
            _authByCookie = common.AuthByCookie;
            _PKCS1PublicKeyPath = common.Pkcs1PublicKeyPath;
            _phoneHashSalt = secrets.PhoneHashSalt;
            _refreshJwtKey = secrets.RefreshJwtKey;
        }

        [SwaggerOperation(
            Tags = new[] { "註冊相關" },
            Summary = "早鳥註冊",
            Description = ""
        )]
        [Route("register-for-early-bird")]
        [AuthorizeFactory(AUTH_TYPE.SIGN_UP)]
        [HttpPost]
        public ActionResult<dynamic> registerForEarlyBird([FromBody] DTOs.SignUp dto, DTOs.JwtExtraPayload extraPayload)
        {
            User user = UserDataservice.GetOneByEmail(_dbContext, extraPayload.Email, true);
            if (user == null)
            {
                throw new CustomException(Homo.AuthApi.ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }

            string pseudoPhone = CryptographicHelper.GetHiddenString(extraPayload.Phone, 2, 2);
            string encryptPhone = CryptographicHelper.GetRSAEncryptResult(_PKCS1PublicKeyPath, extraPayload.Phone);
            string hashPhone = CryptographicHelper.GenerateSaltedHash(extraPayload.Phone, _phoneHashSalt);
            string salt = CryptographicHelper.GetSalt(64);
            string hash = CryptographicHelper.GenerateSaltedHash(dto.Password, salt);

            UserDataservice.RegisterForEarlyAdaptor(_dbContext, user.Id, encryptPhone, pseudoPhone, hashPhone, salt, hash);

            var userPayload = new DTOs.JwtExtraPayload()
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
                PseudonymousPhone = pseudoPhone,
                PseudonymousAddress = user.PseudonymousAddress,
                IsOverSubscriptionPlan = user.IsOverSubscriptionPlan
            };

            List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(_dbContext, extraPayload.Id);
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