using System;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Homo.Core.Helpers;

namespace Homo.IotApi
{
    public class ClearExpiredPipelineExecuteLogsCronJobService : CronJobService
    {
        private readonly string _dbc;

        public ClearExpiredPipelineExecuteLogsCronJobService(IScheduleConfig<ClearExpiredPipelineExecuteLogsCronJobService> config, IServiceProvider serviceProvider, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, IOptions<AppSettings> appSettings)
            : base(config.CronExpression, config.TimeZoneInfo, serviceProvider, appSettings, "ClearExpiredPipelineExecuteLogsCronJobService", env)
        {
            _dbc = appSettings.Value.Secrets.DBConnectionString;
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("ClearExpiredPipelineExecuteLogsCronJobService starts.");
            return base.StartAsync(cancellationToken);
        }

        public override async Task<dynamic> DoWork(CancellationToken cancellationToken)
        {
            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            iotBuilder.UseMySql(_dbc, serverVersion);
            IotDbContext _iotDbContext = new IotDbContext(iotBuilder.Options);
            string lockerKey = CryptographicHelper.GetSpecificLengthRandomString(12, true);
            SystemConfigDataservice.OccupeLocker(_iotDbContext, SYSTEM_CONFIG.CLEAR_EXPIRED_PIN_DATA_LOCKER, lockerKey);

            await Task.Delay(5000);
            SystemConfig locker = SystemConfigDataservice.GetOne(_iotDbContext, SYSTEM_CONFIG.CLEAR_EXPIRED_PIN_DATA_LOCKER);
            if (locker.Value != lockerKey)
            {
                return Task.CompletedTask;
            }

            Task<dynamic> task = await recursiveDeleteExecutePipelineLogs(null);
            return task;
        }

        public async Task<dynamic> recursiveDeleteExecutePipelineLogs(long? latestId)
        {
            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            iotBuilder.UseMySql(_dbc, serverVersion);
            IotDbContext _iotDbContext = new IotDbContext(iotBuilder.Options);
            long? currentLatestId = PipelineExecuteLogDataservice.DeleteExpiredDataAndGetLatestItemId(_iotDbContext, 1, 500, latestId);
            if (currentLatestId == null)
            {
                Task task = new Task<dynamic>(() => new { });
                task.Start();
                return task;
            }
            await Task.Delay(5 * 1000);
            return recursiveDeleteExecutePipelineLogs(currentLatestId);
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("ClearExpiredPipelineExecuteLogsCronJobService is stopping.");
            return base.StopAsync(cancellationToken);
        }
    }
}
