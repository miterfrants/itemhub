using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using Homo.Core.Constants;
using Homo.AuthApi;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/devices")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyDeviceController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly string _dbConnectionString;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _adminEmail;
        public MyDeviceController(IotDbContext dbContext, IOptions<AppSettings> appSettings, Homo.Api.CommonLocalizer commonLocalizer)
        {
            _dbContext = dbContext;
            _dbConnectionString = appSettings.Value.Secrets.DBConnectionString;
            _commonLocalizer = commonLocalizer;
            _adminEmail = appSettings.Value.Common.AdminEmail;

        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 取得分頁列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromQuery] int limit, [FromQuery] int page, [FromQuery] string name, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<Device> records = DeviceDataservice.GetList(_dbContext, ownerId, page, limit, name);
            return new
            {
                devices = records,
                rowNum = DeviceDataservice.GetRowNum(_dbContext, ownerId, name)
            };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 取得列表",
            Description = ""
        )]
        [HttpGet]
        [Route("all")]
        public ActionResult<dynamic> getAll(Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            return DeviceDataservice.GetAll(_dbContext, ownerId);
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 建立新裝置",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromBody] DTOs.DevicePayload dto, AuthApi.DTOs.JwtPayload payload)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization == null ? "" : authorization.Substring("Bearer ".Length).Trim();

            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("start", Newtonsoft.Json.Formatting.Indented));
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("this is token", Newtonsoft.Json.Formatting.Indented));
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(token, Newtonsoft.Json.Formatting.Indented));
            // var ccc = JWTHelper.DecodeToken<AuthApi.DTOs.JwtPayload>(token);
            AuthApi.DTOs.JwtPayload ccc = JWTHelper.DecodeToken<AuthApi.DTOs.JwtPayload>(token);
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("--", Newtonsoft.Json.Formatting.Indented));
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("this is ccc", Newtonsoft.Json.Formatting.Indented));
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(ccc, Newtonsoft.Json.Formatting.Indented));
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("--", Newtonsoft.Json.Formatting.Indented));
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("this is ccc.extra.Id", Newtonsoft.Json.Formatting.Indented));
            // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(ccc.Extra.Id, Newtonsoft.Json.Formatting.Indented));
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("--", Newtonsoft.Json.Formatting.Indented));
            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("this is ccc.roles", Newtonsoft.Json.Formatting.Indented));
            // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(ccc.Roles, Newtonsoft.Json.Formatting.Indented));
            // string[] ccccc = ccc.roles.ToArray();

            // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(ccccc, Newtonsoft.Json.Formatting.Indented));

            // string zz = Newtonsoft.Json.JsonConvert.SerializeObject(ccc.Extra);
            // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(zz, Newtonsoft.Json.Formatting.Indented));

            // var extra = JWTHelper.DecodeToken<AuthApi.DTOs.JwtExtraPayload>(zz);


            // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("extra", Newtonsoft.Json.Formatting.Indented));
            // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(extra, Newtonsoft.Json.Formatting.Indented));
            // // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("DecodeToken ", Newtonsoft.Json.Formatting.Indented));
            // // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(aa, Newtonsoft.Json.Formatting.Indented));

            // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("Roles: ", Newtonsoft.Json.Formatting.Indented));
            // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(aa.roles, Newtonsoft.Json.Formatting.Indented));
            // var bb = Newtonsoft.Json.JsonConvert.SerializeObject(aa.extra.Email)


            // string[] roles = Newtonsoft.Json.JsonConvert.DeserializeObject<List<string>>(aa.roles); ;
            // string[] roles = aa.roles.Select(x => x.Roles).ToArray();
            // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("3", Newtonsoft.Json.Formatting.Indented));
            // System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(roles, Newtonsoft.Json.Formatting.Indented));

            System.Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject("end", Newtonsoft.Json.Formatting.Indented));


            // long ownerId = extraPayload.Id;
            // Subscription subscription = SubscriptionDataservice.GetCurrnetOne(_dbContext, ownerId);
            // int subscriptionLevel = subscription == null ? -1 : subscription.PricingPlan;
            // decimal deviceCountInPricingPlan = subscriptionLevel == -1 ? 2 : SubscriptionHelper.GetDeviceCount((PRICING_PLAN)subscription.PricingPlan);
            // decimal currentDeviceCount = DeviceDataservice.GetRowNum(_dbContext, ownerId, null);
            // // extraPayload.IsInRole(ROLE.ADMIN.ToString()
            // if (currentDeviceCount + 1 > deviceCountInPricingPlan)
            // {
            //     var pricingPlans = ConvertHelper.EnumToList(typeof(PRICING_PLAN));
            //     string reason = "";
            //     if (subscriptionLevel + 1 > pricingPlans.Count - 1)
            //     {
            //         reason = _commonLocalizer.Get("moreThanMaxNumberOfDeviceInAnyPlan", null, new Dictionary<string, string>() { { "adminEmail", _adminEmail } });
            //     }
            //     else
            //     {
            //         decimal deviceCountInNextLevelPricingPlan = SubscriptionHelper.GetDeviceCount((PRICING_PLAN)(subscriptionLevel + 1));
            //         reason = _commonLocalizer.Get("moreThanMaxNumberOfDevice", null, new Dictionary<string, string>() { { "deviceCountInNextLevelPricingPlan", deviceCountInNextLevelPricingPlan.ToString() } });
            //     }

            //     throw new CustomException(ERROR_CODE.OVER_PRICING_PLAN, System.Net.HttpStatusCode.Forbidden, new Dictionary<string, string>(){{
            //         "reason", reason
            //     }});
            // }

            throw new CustomException(ERROR_CODE.OVER_PRICING_PLAN, System.Net.HttpStatusCode.Forbidden, new Dictionary<string, string>(){{
                    "reason", "CC"
                }});

            // Device rewRecord = DeviceDataservice.Create(_dbContext, ownerId, dto);
            Device rewRecord = new Device();
            return rewRecord;
        }


        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 批次刪除裝置",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            DeviceDataservice.BatchDelete(_dbContext, ownerId, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 取得單一裝置",
            Description = ""
        )]
        [HttpGet]
        [Route("{id}")]
        public ActionResult<dynamic> getOne([FromRoute] int id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            Device record = DeviceDataservice.GetOne(_dbContext, ownerId, id);
            if (record == null)
            {
                throw new CustomException(Homo.AuthApi.ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }
            return record;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 更新單一裝置基本資料",
            Description = ""
        )]
        [HttpPatch]
        [Route("{id}")]
        public ActionResult<dynamic> update([FromRoute] int id, [FromBody] DTOs.DevicePayload dto, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            DeviceDataservice.Update(_dbContext, ownerId, id, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 刪除單一裝置",
            Description = ""
        )]
        [HttpDelete]
        [Route("{id}")]
        public ActionResult<dynamic> delete([FromRoute] long id, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            DeviceDataservice.Delete(_dbContext, ownerId, id);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 切換裝置狀態",
            Description = ""
        )]
        [HttpPost]
        [Route("{id}/online")]
        public ActionResult<dynamic> online([FromRoute] long id, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            DeviceStateHelper.Create(_dbContext, _dbConnectionString, ownerId, id);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
