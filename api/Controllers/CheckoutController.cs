using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Homo.Api;
using Homo.AuthApi;
using Homo.Core.Constants;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/checkout")]
    [SwaggerUiInvisibility]
    [AuthorizeFactory()]
    public class CheckoutController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly Homo.AuthApi.DBContext _authDbContext;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private string _tapPayEndpoint;
        private string _tapPayPartnerKey;
        private string _tapPayMerchantId;
        private string _websiteUrl;
        private string _apiUrl;
        private string _adminEmail;
        public CheckoutController(IotDbContext dbContext, Homo.AuthApi.DBContext authDbContext, IOptions<AppSettings> appSettings, Homo.Api.CommonLocalizer commonLocalizer)
        {
            _dbContext = dbContext;
            _authDbContext = authDbContext;
            _tapPayEndpoint = appSettings.Value.Common.TapPayEndpointByPrime;
            _tapPayPartnerKey = appSettings.Value.Secrets.TapPayPartnerKey;
            _tapPayMerchantId = appSettings.Value.Secrets.TapPayMerchantId;
            _websiteUrl = appSettings.Value.Common.WebsiteUrl;
            _apiUrl = appSettings.Value.Common.ApiUrl;
            _adminEmail = appSettings.Value.Common.AdminEmail;
            _commonLocalizer = commonLocalizer;

        }

        [SwaggerOperation(
            Tags = new[] { "金流" },
            Summary = "結帳",
            Description = ""
        )]
        [HttpPost]
        [Validate]
        public async Task<dynamic> checkout([FromBody] DTOs.Checkout dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            // avoid duplciate subscribe
            var subscriptionsInDb = SubscriptionDataservice.GetAll(_dbContext, extraPayload.Id, dto.pricingPlan, DateTime.Now);
            List<ConvertHelper.EnumList> plans = ConvertHelper.EnumToList(typeof(PRICING_PLAN));
            if (subscriptionsInDb.Count > 0)
            {
                Subscription firstSubscription = subscriptionsInDb[0];
                ConvertHelper.EnumList existstPlan = plans.Find(x => (int)x.Value == firstSubscription.PricingPlan);
                throw new CustomException(ERROR_CODE.DUPLICATE_SUBSCRIBE,
                    System.Net.HttpStatusCode.BadRequest,
                    new Dictionary<string, string> { { "planName", existstPlan.Label }, { "startAt", firstSubscription.StartAt.ToString("yyyy-MM-dd HH:mm:ss") }, { "endAt", firstSubscription.EndAt.ToString("yyyy-MM-dd HH:mm:ss") } });
            }

            // prepare Tappay request data
            int amount = (int)SubscriptionHelper.GetPrice(dto.pricingPlan);
            // 照比例算價格
            DateTime startOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            int daysInMonth = System.DateTime.DaysInMonth(DateTime.Now.Year, DateTime.Now.Month);
            DateTime endOfMonth = startOfMonth.AddDays(daysInMonth - 1).AddHours(23).AddMinutes(59).AddSeconds(59);
            int infactAmount = (int)Math.Round((decimal)amount * ((endOfMonth - DateTime.Now).Days + 1) / daysInMonth);
            if (infactAmount <= 0)
            {
                infactAmount = 1;
            }
            string planName = plans.Find(x => (int)x.Value == (int)dto.pricingPlan).Label;

            // 在 local 端建立 subscription, transaction
            // subscription 訂閱紀錄
            // transaction 付款紀錄, 有可能一個訂閱紀錄有多個付款紀錄, e.g: 付款失敗再重新付款
            Transaction transaction = TransactionDataservice.Create(_dbContext, new DTOs.Transaction()
            {
                OwnerId = extraPayload.Id,
                Amount = infactAmount
            });
            Subscription subscription = SubscriptionDataservice.Create(_dbContext, new DTOs.Subscription()
            {
                OwnerId = extraPayload.Id,
                StartAt = System.DateTime.Now,
                EndAt = endOfMonth,
                TransactionId = transaction.Id,
                PricingPlan = dto.pricingPlan,
                Status = SUBSCRIPTION_STATUS.PENDING,
            });

            var postBody = new
            {
                prime = dto.prime,
                partner_key = _tapPayPartnerKey,
                merchant_id = _tapPayMerchantId,
                amount = infactAmount,
                details = planName,
                cardholder = new { name = dto.name, email = dto.email, phone_number = dto.phone },
                remember = true,
                three_domain_secure = true,
                order_number = subscription.Id,
                result_url = new
                {
                    frontend_redirect_url = $"{_websiteUrl}/transaction/{transaction.Id}/",
                    backend_notify_url = $"{_apiUrl}/api/v1/tappay"
                }
            };

            StringContent stringContent = new StringContent(JsonConvert.SerializeObject(postBody), System.Text.Encoding.UTF8, "application/json");
            HttpClient http = new HttpClient();
            http.DefaultRequestHeaders.Add("x-api-key", _tapPayPartnerKey);
            HttpResponseMessage responseStream = await http.PostAsync(_tapPayEndpoint, stringContent);
            string result = "";
            using (var sr = new System.IO.StreamReader(await responseStream.Content.ReadAsStreamAsync(), System.Text.Encoding.UTF8))
            {
                result = sr.ReadToEnd();
            }
            DTOs.TapPayResponse response = Newtonsoft.Json.JsonConvert.DeserializeObject<DTOs.TapPayResponse>(result);
            // create transaction log and remove senstive information 
            var withoutSenstiveInfoResponse = JsonConvert.DeserializeObject<IDictionary<string, dynamic>>(JsonConvert.SerializeObject(response));
            withoutSenstiveInfoResponse.Remove("card_secret");

            // 把交易結果存回資料庫
            TransactionDataservice.UpdateTransitionRaw(_dbContext, transaction, JsonConvert.SerializeObject(withoutSenstiveInfoResponse), response.rec_trade_id);
            string errorMessage = "";
            if (response.status != DTOs.TAP_PAY_TRANSACTION_STATUS.OK)
            {
                errorMessage = response.msg ?? response.bank_result_msg;
            }

            if (response.status == DTOs.TAP_PAY_TRANSACTION_STATUS.OK && response.card_secret == null)
            {
                errorMessage = _commonLocalizer.Get("cartSecretIsNull", null, new Dictionary<string, string>() { { "adminEmail", _adminEmail } });
            }

            if (response.status == DTOs.TAP_PAY_TRANSACTION_STATUS.OK && response.card_secret.card_token == null)
            {
                errorMessage = _commonLocalizer.Get("cartTokenIsNull", null, new Dictionary<string, string>() { { "adminEmail", _adminEmail } });
            }

            if (response.status == DTOs.TAP_PAY_TRANSACTION_STATUS.OK && response.card_secret.card_key == null)
            {
                errorMessage = _commonLocalizer.Get("cartKeyIsNull", null, new Dictionary<string, string>() { { "adminEmail", _adminEmail } });
            }

            if (!String.IsNullOrEmpty(errorMessage))
            {
                throw new CustomException(ERROR_CODE.TAPPAY_TRANSACTION_ERROR, System.Net.HttpStatusCode.InternalServerError, new Dictionary<string, string>() { { "message", errorMessage } });
            }

            // save card key and card token to subscription
            SubscriptionDataservice.SaveCardInformation(_dbContext, subscription, response.card_secret.card_key, response.card_secret.card_token);

            // 更新姓名
            Homo.AuthApi.DTOs.UpdateName name = new Homo.AuthApi.DTOs.UpdateName();
            name.FirstName = dto.name.Substring(1, dto.name.Length - 1);
            name.LastName = dto.name.Substring(0, 1);
            UserDataservice.UpdateName(_authDbContext, extraPayload.Id, name, extraPayload.Id);

            return new { Status = CUSTOM_RESPONSE.OK, paymentUrl = response.payment_url };
        }
    }
}