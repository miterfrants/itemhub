using Microsoft.AspNetCore.Mvc;
using Homo.Api;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.AuthApi
{
    [Route("v1/auth")]
    [SwaggerUiInvisibility]
    [AuthorizeFactory]
    [Validate]
    public class AuthDropSelfController : ControllerBase
    {

        private readonly DBContext _dbContext;
        public AuthDropSelfController(DBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "身份驗證" },
            Summary = "刪除",
            Description = ""
        )]
        [Route("drop-self")]
        [HttpPost]
        public ActionResult<dynamic> dropSelf(DTOs.JwtExtraPayload extraPayload)
        {
            UserDataservice.Delete(_dbContext, extraPayload.Id, extraPayload.Id);
            return new { status = "OK" };
        }
    }
}