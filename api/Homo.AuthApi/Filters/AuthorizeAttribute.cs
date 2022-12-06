using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using System.Net;
using System.Linq;
using Homo.Core.Constants;

namespace Homo.AuthApi
{
    public class AuthorizeAttribute : ActionFilterAttribute
    {
        public string[] _roles { get; set; }
        public string _jwtKey { get; set; }
        public bool isAnonymous { get; set; }
        public bool isSignUp { get; set; }
        public bool authByCookie { get; set; }
        public AuthorizeAttribute(string[] roles)
        {
            _roles = roles;
        }
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            string token = null;
            if (authByCookie)
            {
                context.HttpContext.Request.Cookies.TryGetValue("token", out token);
            }
            else
            {
                string authorization = context.HttpContext.Request.Headers["Authorization"];
                token = authorization == null ? "" : authorization.Substring("Bearer ".Length).Trim();
            }

            if (token == null || token == "")
            {
                throw new CustomException(ERROR_CODE.UNAUTH_ACCESS_API, HttpStatusCode.Unauthorized);
            }
            if (JWTHelper.isExpired(token))
            {
                throw new CustomException(ERROR_CODE.TOKEN_EXPIRED, HttpStatusCode.Unauthorized);
            }
            ClaimsPrincipal payload = JWTHelper.GetPayload(_jwtKey, token);
            if (payload == null)
            {
                throw new CustomException(ERROR_CODE.UNAUTH_ACCESS_API, HttpStatusCode.Unauthorized);
            }

            var extraPayload = Newtonsoft.Json.JsonConvert.DeserializeObject<DTOs.JwtExtraPayload>(payload.FindFirstValue("extra"));
            long? userId = extraPayload.Id;

            if (userId == null && isSignUp == false)
            {
                throw new CustomException(ERROR_CODE.USER_NOT_FOUND, HttpStatusCode.NotFound);
            }

            // permission block 
            if (isSignUp == false)
            {
                bool isPass = (_roles != null && _roles.Any(x => payload.IsInRole(x.ToString())))
                    || _roles.Contains(ROLE.NO.ToString())
                    || payload.IsInRole(ROLE.ADMIN.ToString());

                if (!isPass)
                {
                    throw new CustomException(ERROR_CODE.UNAUTH_ACCESS_API, HttpStatusCode.Unauthorized);
                }
            }

            // pass extraPayload to controller function
            context.ActionArguments["extraPayload"] = Newtonsoft.Json.JsonConvert.DeserializeObject<DTOs.JwtExtraPayload>(payload.FindFirstValue("extra"));
            context.ActionArguments["isVIP"] = payload.IsInRole("VIP");
        }
    }
}