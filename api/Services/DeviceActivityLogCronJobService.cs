using System;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Homo.Core.Helpers;

namespace Homo.IotApi
{
    public class DeviceActivityLogCronJobService : CronJobService
    {
        private readonly string _envName;
        private readonly string _dbc;

        public DeviceActivityLogCronJobService(IScheduleConfig<DeviceActivityLogCronJobService> config, IServiceProvider serviceProvider, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, IOptions<AppSettings> appSettings)
            : base(config.CronExpression, config.TimeZoneInfo, serviceProvider, appSettings, "DeviceActivityLogCronJobService", env)
        {
            _envName = env.EnvironmentName;
            _dbc = appSettings.Value.Secrets.DBConnectionString;
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("DeviceActivityLogCronJobService starts.");
            return base.StartAsync(cancellationToken);
        }

        public override async Task<dynamic> DoWork(CancellationToken cancellationToken)
        {
            Console.WriteLine($"{DateTime.Now:hh:mm:ss} DeviceActivityLogCronJobService is working.");
            Task<dynamic> task = (await recursiveDeleteActivityLogs(null));
            return task;
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("DeviceActivityLogCronJobService is stopping.");
            return base.StopAsync(cancellationToken);
        }

        public async Task<dynamic> recursiveDeleteActivityLogs(long? latestId)
        {
            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            iotBuilder.UseMySql(_dbc, serverVersion);
            IotDbContext _iotDbContext = new IotDbContext(iotBuilder.Options);
            string lockerKey = CryptographicHelper.GetSpecificLengthRandomString(12, true);
            SystemConfigDataservice.OccupeLocker(_iotDbContext, SYSTEM_CONFIG.CLEAR_DEVICE_ACTIVITY_LOG_LOCKER, lockerKey);

            await Task.Delay(5000);
            SystemConfig locker = SystemConfigDataservice.GetOne(_iotDbContext, SYSTEM_CONFIG.CLEAR_DEVICE_ACTIVITY_LOG_LOCKER);
            if (locker.Value != lockerKey)
            {
                return Task.FromResult<dynamic>(true);
            }


            long? currentLatestId = DeviceActivityLogDataservice.Delete(_iotDbContext, DateTime.Now.AddDays(-1), 1, 500, latestId);
            if (currentLatestId == null)
            {
                Task task = new Task<dynamic>(() => new { });
                task.Start();
                return task;
            }
            await Task.Delay(5 * 1000);
            return (await recursiveDeleteActivityLogs(currentLatestId));
        }
    }
}
