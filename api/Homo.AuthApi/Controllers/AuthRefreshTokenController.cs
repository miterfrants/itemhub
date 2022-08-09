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
    [AuthorizeFactory(AUTH_TYPE.REFRESH)]
    public class AuthRefreshTokenController : ControllerBase
    {

        private readonly DBContext _dbContext;
        private readonly string _jwtKey;
        private readonly string _dashboardJwtKey;
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
        public AuthRefreshTokenController(
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
            _dashboardJwtKey = secrets.DashboardJwtKey;
        }

        [SwaggerOperation(
            Tags = new[] { "身份驗證" },
            Summary = "更新 Website Token",
            Description = ""
        )]
        [Route("refresh-token")]
        [HttpPost]
        public ActionResult<dynamic> refreshToken(DTOs.JwtExtraPayload extraPayload)
        {
            List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(_dbContext, extraPayload.Id);
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
            Summary = "更新 Dashboard Token",
            Description = ""
        )]
        [Route("refresh-dashboard-token")]
        [HttpPost]
        [Validate]
        public dynamic refreshDashboardToken(DTOs.JwtExtraPayload extraPayload)
        {
            List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(_dbContext, extraPayload.Id);
            string[] roles = permissions.SelectMany(x => Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(x.Roles)).ToArray();

            string dashboardToken = JWTHelper.GenerateToken(_dashboardJwtKey, 3 * 24 * 60, extraPayload, roles);
            string dashboardRefreshToken = JWTHelper.GenerateToken(_refreshJwtKey, 6 * 30 * 24 * 60, extraPayload, roles);
            if (_authByCookie)
            {
                Response.Cookies.Append("dashboardToken", dashboardToken, AuthHelper.GetSecureCookieOptions());
                Response.Cookies.Append("dashboardRefreshToken", dashboardRefreshToken, AuthHelper.GetSecureCookieOptions());

                return new
                {
                    status = CUSTOM_RESPONSE.OK,
                };
            }
            else
            {
                return new { dashboardToken = dashboardToken, dashboardRefreshToken = dashboardRefreshToken };
            }

        }


    }
}