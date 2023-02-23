using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using Homo.Core.Constants;
using Homo.AuthApi;
using Swashbuckle.AspNetCore.Annotations;
using System.Linq;

namespace Homo.IotApi
{
    [Route("v1/my/devices")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyDeviceController : ControllerBase
    {
        private readonly IotDbContext _iotDbContext;
        private readonly DBContext _dbContext;
        private readonly string _dbConnectionString;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _adminEmail;
        private readonly string _mailTemplatePath;
        private readonly string _smsUsername;
        private readonly string _smsPassword;
        private readonly string _smsClientUrl;
        private readonly string _systemEmail;
        private readonly string _sendGridApiKey;
        public MyDeviceController(IotDbContext iotDbContext, DBContext dbContext, IOptions<AppSettings> appSettings, Homo.Api.CommonLocalizer commonLocalizer)
        {
            _iotDbContext = iotDbContext;
            _dbContext = dbContext;

            _dbConnectionString = appSettings.Value.Secrets.DBConnectionString;
            _commonLocalizer = commonLocalizer;
            _adminEmail = appSettings.Value.Common.AdminEmail;
            _mailTemplatePath = appSettings.Value.Common.StaticPath;
            _smsUsername = appSettings.Value.Secrets.SmsUsername;
            _smsPassword = appSettings.Value.Secrets.SmsPassword;
            _smsClientUrl = appSettings.Value.Common.SmsClientUrl;
            _systemEmail = appSettings.Value.Common.SystemEmail;
            _sendGridApiKey = appSettings.Value.Secrets.SendGridApiKey;

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
            List<Device> records = DeviceDataservice.GetList(_iotDbContext, ownerId, page, limit, name);
            List<DeviceActivityLog> lastLogs = DeviceActivityLogDataservice.GetLast(_iotDbContext, ownerId, records.Select(x => x.Id).ToList<long>());
            return new
            {
                devices = records.Select(x =>
                new
                {
                    x.CreatedAt,
                    x.DeletedAt,
                    x.EditedAt,
                    x.Id,
                    x.Info,
                    x.Microcontroller,
                    x.Name,
                    x.Online,
                    x.OwnerId,
                    x.Protocol,
                    x.OfflineNotificationTarget,
                    x.IsOfflineNotification,
                    LastActivityLogCreatedAt = lastLogs.Where(item => item.DeviceId == x.Id).FirstOrDefault()?.CreatedAt
                }),
                rowNum = DeviceDataservice.GetRowNum(_iotDbContext, ownerId, name)
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
            return DeviceDataservice.GetAll(_iotDbContext, ownerId);
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 建立新裝置",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromBody] DTOs.DevicePayload dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload, bool isVIP)
        {
            long ownerId = extraPayload.Id;
            Subscription subscription = SubscriptionDataservice.GetCurrnetOne(_iotDbContext, ownerId);
            int subscriptionLevel = subscription == null ? -1 : subscription.PricingPlan;
            decimal deviceCountInPricingPlan = subscriptionLevel == -1 ? 2 : SubscriptionHelper.GetDeviceCount((PRICING_PLAN)subscription.PricingPlan);
            decimal currentDeviceCount = DeviceDataservice.GetRowNum(_iotDbContext, ownerId, null);

            if ((currentDeviceCount + 1 > deviceCountInPricingPlan) && !isVIP)
            {
                var pricingPlans = ConvertHelper.EnumToList(typeof(PRICING_PLAN));
                string reason = "";
                if (subscriptionLevel + 1 > pricingPlans.Count - 1)
                {
                    reason = _commonLocalizer.Get("moreThanMaxNumberOfDeviceInAnyPlan", null, new Dictionary<string, string>() { { "adminEmail", _adminEmail } });
                }
                else
                {
                    decimal deviceCountInNextLevelPricingPlan = SubscriptionHelper.GetDeviceCount((PRICING_PLAN)(subscriptionLevel + 1));
                    reason = _commonLocalizer.Get("moreThanMaxNumberOfDevice", null, new Dictionary<string, string>() { { "deviceCountInNextLevelPricingPlan", deviceCountInNextLevelPricingPlan.ToString() } });
                }

                throw new CustomException(ERROR_CODE.OVER_PRICING_PLAN, System.Net.HttpStatusCode.Forbidden, new Dictionary<string, string>(){{
                    "reason", reason
                }});
            }

            Device rewRecord = DeviceDataservice.Create(_iotDbContext, ownerId, dto);
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
            DeviceDataservice.BatchDelete(_iotDbContext, ownerId, ids);
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
            Device record = DeviceDataservice.GetOne(_iotDbContext, ownerId, id);
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
            bool isVIP = RelationOfGroupAndUserDataservice.IsVIP(_dbContext, ownerId);
            var subscrioption = SubscriptionDataservice.GetCurrnetOne(_iotDbContext, ownerId);
            if (
                dto.IsOfflineNotification == true && dto.OfflineNotificationTarget.Length > 0
                && !isVIP && subscrioption == null
            )
            {
                throw new CustomException(ERROR_CODE.OFFLINE_NOTIFICATION_USAGE_LIMIT);
            }
            DeviceDataservice.Update(_iotDbContext, ownerId, id, dto);
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
            DeviceDataservice.Delete(_iotDbContext, ownerId, id);
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
            DeviceStateHelper.Create(_iotDbContext, _dbConnectionString, ownerId, id, _commonLocalizer, _mailTemplatePath, _systemEmail, _sendGridApiKey, _smsClientUrl, _smsUsername, _smsPassword);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
