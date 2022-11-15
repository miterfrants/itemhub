using System;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Homo.Core.Helpers;

namespace Homo.IotApi
{
    public class ClearTriggerLogCronJob : CronJobService
    {
        private readonly string _envName;
        private readonly string _tapPayPartnerKey;
        private readonly string _tapPayMerchantId;
        private readonly string _tapPayEndpointByToken;
        private readonly string _dbc;

        public ClearTriggerLogCronJob(IScheduleConfig<ClearTriggerLogCronJob> config, IServiceProvider serviceProvider, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, IOptions<AppSettings> appSettings)
            : base(config.CronExpression, config.TimeZoneInfo, serviceProvider, appSettings, "ClearTriggerLogCronJob", env)
        {
            _envName = env.EnvironmentName;
            _dbc = appSettings.Value.Secrets.DBConnectionString;
            _tapPayMerchantId = appSettings.Value.Secrets.TapPayMerchantId;
            _tapPayPartnerKey = appSettings.Value.Secrets.TapPayPartnerKey;
            _tapPayEndpointByToken = appSettings.Value.Common.TapPayEndpointByToken;

        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("ClearTriggerLogCronJob starts.");
            return base.StartAsync(cancellationToken);
        }

        public override async Task<dynamic> DoWork(CancellationToken cancellationToken)
        {
            Console.WriteLine($"{DateTime.Now:hh:mm:ss} TriggerLogCronJob is working.");
            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            iotBuilder.UseMySql(_dbc, serverVersion);
            IotDbContext _iotDbContext = new IotDbContext(iotBuilder.Options);

            string lockerKey = CryptographicHelper.GetSpecificLengthRandomString(12, true);
            SystemConfigDataservice.OccupeLocker(_iotDbContext, SYSTEM_CONFIG.CLEAR_TRIGGER_LOG_LOCKER, lockerKey);

            await Task.Delay(5000);
            SystemConfig locker = SystemConfigDataservice.GetOne(_iotDbContext, SYSTEM_CONFIG.CLEAR_TRIGGER_LOG_LOCKER);
            if (locker.Value != lockerKey)
            {
                return Task.CompletedTask;
            }

            TriggerLogDataservice.Delete(_iotDbContext, DateTime.Now.AddDays(-50), null);
            return Task.CompletedTask;
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("ClearTriggerLogCronJob is stopping.");
            return base.StopAsync(cancellationToken);
        }
    }
}
