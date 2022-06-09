using System;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using Homo.AuthApi;
using System.Linq;
using System.Net.Http;
using Newtonsoft.Json;
using Homo.Core.Helpers;

namespace Homo.IotApi
{
    public class AutoPaymentCronJob : CronJobService
    {
        private readonly string _envName;
        private readonly string _tapPayPartnerKey;
        private readonly string _tapPayMerchantId;
        private readonly string _tapPayEndpointByToken;
        private readonly string _dbc;

        public AutoPaymentCronJob(IScheduleConfig<AutoPaymentCronJob> config, IServiceProvider serviceProvider, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, IOptions<AppSettings> appSettings)
            : base(config.CronExpression, config.TimeZoneInfo, serviceProvider)
        {
            _envName = env.EnvironmentName;
            _dbc = appSettings.Value.Secrets.DBConnectionString;
            _tapPayMerchantId = appSettings.Value.Secrets.TapPayMerchantId;
            _tapPayPartnerKey = appSettings.Value.Secrets.TapPayPartnerKey;
            _tapPayEndpointByToken = appSettings.Value.Common.TapPayEndpointByToken;

        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("AutoPaymentCronJob starts.");
            return base.StartAsync(cancellationToken);
        }

        public override async Task<dynamic> DoWork(CancellationToken cancellationToken)
        {
            if (DateTime.Now.Day != 1)
            {
                return Task.CompletedTask;
            }


            Console.WriteLine($"{DateTime.Now:hh:mm:ss} AutoPaymentCronJob is working.");
            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            DbContextOptionsBuilder<DBContext> builder = new DbContextOptionsBuilder<DBContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            iotBuilder.UseMySql(_dbc, serverVersion);
            builder.UseMySql(_dbc, serverVersion);
            IotDbContext _iotDbContext = new IotDbContext(iotBuilder.Options);
            DBContext _dbContext = new DBContext(builder.Options);

            string lockerKey = CryptographicHelper.GetSpecificLengthRandomString(12, true);
            SystemConfigDataservice.OccupeLocker(_iotDbContext, SYSTEM_CONFIG.AUTO_PAYMENT_LOCKER, lockerKey);

            await Task.Delay(5000);
            SystemConfig locker = SystemConfigDataservice.GetOne(_iotDbContext, SYSTEM_CONFIG.AUTO_PAYMENT_LOCKER);
            if (locker.Value != lockerKey)
            {
                return Task.CompletedTask;
            }

            List<Subscription> subscriptions = SubscriptionDataservice.GetShouldBeAutoPayNextPeriod(_iotDbContext, DateTime.Now);

            List<long> subscriberIds = subscriptions.Select(x => x.OwnerId).ToList<long>();
            List<User> subscribers = UserDataservice.GetAllByIds(subscriberIds, _dbContext);
            List<ConvertHelper.EnumList> plans = ConvertHelper.EnumToList(typeof(PRICING_PLAN));
            for (int i = 0; i < subscriptions.Count; i++)
            {
                Subscription subscription = subscriptions[i];
                int amount = (int)SubscriptionHelper.GetPrice((PRICING_PLAN)subscription.PricingPlan);
                string planName = plans.Find(x => (int)x.Value == (int)subscription.PricingPlan).Label;
                User subscriber = subscribers.FirstOrDefault(x => x.Id == subscription.OwnerId);
                if (subscriber == null)
                {
                    Console.WriteLine($"Could not find subscriber by id: {subscription.OwnerId}");
                    continue;
                }


                DTOs.TapPayResponse response = null;
                long transactionId = 0;

                if (!subscriber.IsEarlyBird || (subscriber.IsEarlyBird && (PRICING_PLAN)subscription.PricingPlan != PRICING_PLAN.ADVANCE))
                {
                    var postBody = new
                    {
                        card_key = subscription.CardKey,
                        card_token = subscription.CardToken,
                        partner_key = _tapPayPartnerKey,
                        currency = "TWD",
                        merchant_id = _tapPayMerchantId,
                        details = planName,
                        amount = amount
                    };
                    StringContent stringContent = new StringContent(JsonConvert.SerializeObject(postBody), System.Text.Encoding.UTF8, "application/json");
                    HttpClient http = new HttpClient();
                    http.DefaultRequestHeaders.Add("x-api-key", _tapPayPartnerKey);
                    HttpResponseMessage responseStream = await http.PostAsync(_tapPayEndpointByToken, stringContent);
                    string result = "";
                    using (var sr = new System.IO.StreamReader(await responseStream.Content.ReadAsStreamAsync(), System.Text.Encoding.UTF8))
                    {
                        result = sr.ReadToEnd();
                    }
                    response = Newtonsoft.Json.JsonConvert.DeserializeObject<DTOs.TapPayResponse>(result);

                    // create transaction log and remove senstive information 
                    Transaction transaction = TransactionDataservice.Create(_iotDbContext, new DTOs.Transaction()
                    {
                        Raw = JsonConvert.SerializeObject(response),
                        OwnerId = subscriber.Id,
                        Amount = amount,
                        ExternalTransactionId = response.rec_trade_id,
                        Status = response.status == DTOs.TAP_PAY_TRANSACTION_STATUS.OK ? TRANSACTION_STATUS.PAID :
                            response.status == DTOs.TAP_PAY_TRANSACTION_STATUS.ERROR ? TRANSACTION_STATUS.ERROR :
                            TRANSACTION_STATUS.PENDING
                    });
                    transactionId = transaction.Id;
                }

                // create user subscription log
                DateTime startAt = DateTime.Now;
                int daysInMonth = System.DateTime.DaysInMonth(startAt.Year, startAt.Month);
                DateTime startOfMonth = new DateTime(startAt.Year, startAt.Month, 1);
                DateTime endOfMonth = startOfMonth.AddDays(daysInMonth - 1).AddHours(23).AddMinutes(59).AddSeconds(59);

                if (
                    (subscriber.IsEarlyBird && (PRICING_PLAN)subscription.PricingPlan == PRICING_PLAN.ADVANCE) ||
                    (response != null && response.status == DTOs.TAP_PAY_TRANSACTION_STATUS.OK)
                )
                {
                    SubscriptionDataservice.Create(_iotDbContext, new DTOs.Subscription()
                    {
                        OwnerId = subscriber.Id,
                        StartAt = startOfMonth,
                        EndAt = endOfMonth,
                        PricingPlan = (PRICING_PLAN)subscription.PricingPlan,
                        TransactionId = transactionId,
                        CardKey = subscription.CardKey,
                        Status = SUBSCRIPTION_STATUS.PAID,
                        CardToken = subscription.CardToken,
                    });
                }
                else
                {
                    System.Console.WriteLine($"Auto Payment Error :{Newtonsoft.Json.JsonConvert.SerializeObject(response, Newtonsoft.Json.Formatting.Indented)}");
                }
            }

            return Task.CompletedTask;
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("Auto Payment is stopping.");
            return base.StopAsync(cancellationToken);
        }
    }
}
