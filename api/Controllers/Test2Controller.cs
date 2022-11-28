using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;

namespace Homo.AuthApi
{
    [Route("v1/test2")]
    public class Test2Controller : ControllerBase
    {
        public Test2Controller(Microsoft.AspNetCore.Hosting.IWebHostEnvironment env)
        {
        }

        [HttpGet]
        public dynamic xxxxx()
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization == null ? "" : authorization.Substring("Bearer ".Length).Trim();
            var test = JWTHelper.DecodeToken<DTOs.JwtPayload>(token);
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(test, Newtonsoft.Json.Formatting.Indented));
            return new { };
        }
    }
}