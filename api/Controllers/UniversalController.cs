using Microsoft.AspNetCore.Mvc;
using Homo.AuthApi;
using Homo.Api;
using System.Collections.Generic;
using System.Linq;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/universal")]
    [SwaggerUiInvisibility]
    public class IotUniversalController : ControllerBase
    {

        private readonly IotDbContext _dbContext;
        public IotUniversalController(IotDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [SwaggerOperation(
            Tags = new[] { "常數" },
            Summary = "價格方案",
            Description = ""
        )]
        [Route("pricing-plans")]
        [HttpGet]
        public ActionResult<dynamic> getPricingPlans()
        {
            List<dynamic> pricingPlans = ConvertHelper.EnumToList(typeof(PRICING_PLAN)).Select(x =>
            new
            {
                x.Key,
                x.Value,
                x.Label,
                Price = SubscriptionHelper.GetPrice((PRICING_PLAN)x.Value),
                DeviceCount = SubscriptionHelper.GetDeviceCount((PRICING_PLAN)x.Value),
                Frequency = SubscriptionHelper.GetFrequency((PRICING_PLAN)x.Value),
                StorageTime = SubscriptionHelper.GetStorageTime((PRICING_PLAN)x.Value),
                NotificationEmailRateLimit = SubscriptionHelper.GetTriggerEmailNotificastionRateLimit((PRICING_PLAN)x.Value),
                NotificationSmsRateLimit = SubscriptionHelper.GetTriggerSmsNotificastionRateLimit((PRICING_PLAN)x.Value),

            }).ToList<dynamic>();

            return pricingPlans;
        }

        [SwaggerOperation(
            Tags = new[] { "常數" },
            Summary = "發票類型",
            Description = ""
        )]
        [Route("invoice-types")]
        [HttpGet]
        public ActionResult<dynamic> getInvoiceTypes()
        {
            List<dynamic> invoice = ConvertHelper.EnumToList(typeof(INVOICE_TYPES)).Select(x =>
            new
            {
                x.Key,
                x.Value,
                x.Label
            }).ToList<dynamic>();

            return invoice;
        }

        [SwaggerOperation(
            Tags = new[] { "常數" },
            Summary = "觸發演算子",
            Description = ""
        )]
        [Route("trigger-operators")]
        [HttpGet]
        public ActionResult<dynamic> getTriggerOperators()
        {
            List<ConvertHelper.EnumList> triggerOperators = ConvertHelper.EnumToList(typeof(TRIGGER_OPERATOR));
            return triggerOperators.Select(x => new
            {
                x.Key,
                x.Label,
                x.Value,
                Symbol = TriggerOperatorHelper.GetSymbol(x.Key)
            }).ToList<dynamic>();
        }

        [Route("trigger-notification-periods")]
        [HttpGet]
        public ActionResult<dynamic> getTriggerNotificationPeriods()
        {
            List<ConvertHelper.EnumList> triggerNotificationPeriods = ConvertHelper.EnumToList(typeof(TRIGGER_NOTIFICATION_PERIOD));
            return triggerNotificationPeriods.Select(x => new
            {
                x.Key,
                x.Label,
                x.Value,
            }).ToList<dynamic>();
        }

        [SwaggerOperation(
            Tags = new[] { "常數" },
            Summary = "交易狀態",
            Description = ""
        )]
        [Route("transaction-status")]
        [HttpGet]
        public ActionResult<dynamic> getTransactionStatus()
        {
            return ConvertHelper.EnumToList(typeof(TRANSACTION_STATUS));
        }

        [SwaggerOperation(
            Tags = new[] { "常數" },
            Summary = "單晶片類型",
            Description = ""
        )]
        [Route("microcontroller")]
        [HttpGet]
        public ActionResult<dynamic> getMicrocontroller()
        {
            return _dbContext.Microcontroller.Select(x => new
            {
                x.Id,
                x.Key,
                Pins = Newtonsoft.Json.JsonConvert.DeserializeObject<List<DTOs.McuPin>>(x.Pins),
                Memo = x.Memo,
                SupportedProtocols = Newtonsoft.Json.JsonConvert.DeserializeObject<List<string>>(x.SupportedProtocols)
            }).ToList();
        }

        [SwaggerOperation(
            Tags = new[] { "常數" },
            Summary = "PIN 模式",
            Description = ""
        )]
        [Route("pin-types")]
        [HttpGet]
        public ActionResult<dynamic> getPinTypes()
        {
            return ConvertHelper.EnumToList(typeof(PIN_TYPE));
        }


        [SwaggerOperation(
            Tags = new[] { "常數" },
            Summary = "觸發類型",
            Description = ""
        )]
        [Route("trigger-types")]
        [HttpGet]
        public ActionResult<dynamic> getTriggerType()
        {
            // 目前只有實作 device current value 和 notification 
            return ConvertHelper.EnumToList(typeof(TRIGGER_TYPE)).Where(x => x.Key == TRIGGER_TYPE.CHANGE_DEVICE_STATE.ToString() || x.Key == TRIGGER_TYPE.NOTIFICATION.ToString()).ToList();
        }

        [SwaggerOperation(
            Tags = new[] { "常數" },
            Summary = "Dashboard Monitor 模式",
            Description = ""
        )]
        [Route("dashboard-monitor-mode")]
        [HttpGet]
        public ActionResult<dynamic> getDashboardMonitorMode()
        {
            return ConvertHelper.EnumToList(typeof(DASHBOARD_MONITOR_MODE));
        }

        [SwaggerOperation(
            Tags = new[] { "常數" },
            Summary = "Firmware Protocol",
            Description = ""
        )]
        [Route("protocols")]
        [HttpGet]
        public ActionResult<dynamic> getFirmwareProtocol()
        {
            return ConvertHelper.EnumToList(typeof(FIRMWARE_PROTOCOL));
        }
    }
}
