using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Homo.Api;
using Homo.AuthApi;
using Homo.Core.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Homo.IotApi
{
    public class SendOverPlanNotificationCronJobService : CronJobService
    {
        private readonly CommonLocalizer _commonLocalizer;
        private readonly string _envName;
        private readonly string _dbc;
        private readonly string _systemEmail;
        private readonly string _sendGridApiKey;
        private readonly string _websiteUrl;
        private readonly string _adminEmail;

        private readonly string _staticPath;

        public SendOverPlanNotificationCronJobService(IScheduleConfig<SendOverPlanNotificationCronJobService> config, IServiceProvider serviceProvider, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, IOptions<AppSettings> appSettings, Homo.Api.CommonLocalizer commonLocalizer) : base(config.CronExpression, config.TimeZoneInfo, serviceProvider)
        {
            _commonLocalizer = commonLocalizer;
            _envName = env.EnvironmentName;
            _dbc = appSettings.Value.Secrets.DBConnectionString;
            _systemEmail = appSettings.Value.Common.SystemEmail;
            _sendGridApiKey = appSettings.Value.Secrets.SendGridApiKey;
            _websiteUrl = appSettings.Value.Common.WebsiteUrl;
            _adminEmail = appSettings.Value.Common.AdminEmail;
            _staticPath = appSettings.Value.Common.StaticPath;
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("SendOverPlanNotificationCronJobService starts.");
            return base.StartAsync(cancellationToken);
        }

        public override async Task<dynamic> DoWork(CancellationToken cancellationToken)
        {
            Console.WriteLine($"{DateTime.Now:hh:mm:ss} SendOverPlanNotificationCronJobService is working.");
            DbContextOptionsBuilder<DBContext> builder = new DbContextOptionsBuilder<DBContext>();
            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            builder.UseMySql(_dbc, serverVersion);
            iotBuilder.UseMySql(_dbc, serverVersion);
            DBContext _dbContext = new DBContext(builder.Options);
            IotDbContext _iotDbContext = new IotDbContext(iotBuilder.Options);

            string lockerKey = CryptographicHelper.GetSpecificLengthRandomString(12, true);
            SystemConfigDataservice.OccupeLocker(_iotDbContext, SYSTEM_CONFIG.SEND_OVER_PLAN_NOTIFICATION_LOCKER, lockerKey);

            await Task.Delay(5000);
            SystemConfig locker = SystemConfigDataservice.GetOne(_iotDbContext, SYSTEM_CONFIG.SEND_OVER_PLAN_NOTIFICATION_LOCKER);
            if (locker.Value != lockerKey)
            {
                return Task.CompletedTask;
            }

            List<User> overPlanUsers = UserDataservice.GetOverPlanAll(_dbContext);
            for (int i = 0; i < overPlanUsers.Count; i++)
            {
                User user = overPlanUsers[i];
                List<Homo.AuthApi.ConvertHelper.EnumList> frequency = ConvertHelper.EnumToList(typeof(SEND_OVER_PLAN_NOTIFICATION_FREQUENCY));
                List<Homo.AuthApi.ConvertHelper.EnumList> pricingPlans = ConvertHelper.EnumToList(typeof(PRICING_PLAN));
                if (user.SendOverPlanNotificationCount >= frequency.Count)
                {
                    continue;
                }

                DateTime? whenToSendNextTime = null;
                if (user.SendOverPlanNotificationAt != null)
                {
                    whenToSendNextTime = user.SendOverPlanNotificationAt.GetValueOrDefault().AddDays(7 * (int)frequency[user.SendOverPlanNotificationCount + 1].Value);
                }

                bool shouldBeSent = false;
                if (whenToSendNextTime == null || DateTime.Now >= whenToSendNextTime)
                {
                    shouldBeSent = true;
                }

                if (shouldBeSent)
                {
                    Subscription subscription = SubscriptionDataservice.GetCurrnetOne(_iotDbContext, user.Id);
                    int nextSubscription = 0;
                    if (subscription != null)
                    {
                        nextSubscription = subscription.PricingPlan + 1;
                    }
                    string content = "";
                    string link = "";
                    string btn = "";
                    if (nextSubscription > pricingPlans.Count - 1)
                    {
                        content = "mailContentOverTopPlanDescription";
                        link = "mailto:itemhub.tw@gmail.com";
                        btn = "mailContentOverTopPlanBtn";
                    }
                    else
                    {
                        content = "mailContentOverPlanDescription";
                        link = $"{_websiteUrl}/checkout/?pricingPlan={nextSubscription}";
                        btn = "mailContentOverPlanBtn";
                    }

                    MailTemplate template = MailTemplateHelper.Get(MAIL_TEMPLATE.OVER_SUBSCRIPTION, _staticPath);
                    template = MailTemplateHelper.ReplaceVariable(template, new
                    {
                        websiteUrl = _websiteUrl,
                        adminEmail = _adminEmail,
                        link = link,
                        hello = _commonLocalizer.Get("hello"),
                        mailContentDescription = _commonLocalizer.Get(content),
                        mailContentBtn = _commonLocalizer.Get(btn),
                        mailContentSystemAutoSendEmail = _commonLocalizer.Get("mailContentSystemAutoSendEmail")
                    });

                    MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
                    {
                        Subject = _commonLocalizer.Get(template.Subject),
                        Content = template.Content
                    }, _systemEmail, user.Email, _sendGridApiKey);

                    user.SendOverPlanNotificationCount += 1;
                    user.SendOverPlanNotificationAt = DateTime.Now;
                }

            }

            _dbContext.SaveChanges();
            return Task.CompletedTask;
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("SendOverPlanNotificationCronJobService is stopping.");
            return base.StopAsync(cancellationToken);
        }

    }
}