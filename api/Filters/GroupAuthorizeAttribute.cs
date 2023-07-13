using System;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Homo.AuthApi;
using Homo.Core.Constants;


namespace Homo.IotApi
{
    public class GroupAuthorizeAttribute : ActionFilterAttribute
    {
        private string _dbc;
        private string _jwtKey;
        public GroupAuthorizeAttribute(string dbc, string jwtKey)
        {
            _dbc = dbc;
            _jwtKey = jwtKey;
        }
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            string authorization = context.HttpContext.Request.Headers["Authorization"];
            var token = authorization == null ? "" : authorization.Substring("Bearer ".Length).Trim();
            ClaimsPrincipal payload = JWTHelper.GetPayload(_jwtKey, token);
            var extraPayload = Newtonsoft.Json.JsonConvert.DeserializeObject<AuthApi.DTOs.JwtExtraPayload>(payload.FindFirstValue("extra"));
            long userId = (long)extraPayload.Id;
            long groupId = 0;
            try
            {
                long.TryParse(context.RouteData.Values["groupId"].ToString(), out groupId);
            }
            catch (System.Exception)
            {
                throw new CustomException(ERROR_CODE.COULD_NOT_FOUND_GROUP_ID_FROM_ROUTER, System.Net.HttpStatusCode.Forbidden);
            }
            DbContextOptionsBuilder<DBContext> dbContextBuilder = new DbContextOptionsBuilder<DBContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            dbContextBuilder.UseMySql(_dbc, serverVersion);
            using (DBContext dbContext = new DBContext(dbContextBuilder.Options))
            {
                var relation = RelationOfGroupAndUserDataservice.GetOne(dbContext, userId, groupId);
                if (relation == null)
                {
                    throw new CustomException(AuthApi.ERROR_CODE.UNAUTH_ACCESS_API, System.Net.HttpStatusCode.Forbidden);
                }
            }

        }
    }
}