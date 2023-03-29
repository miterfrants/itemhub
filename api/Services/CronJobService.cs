using System;
using System.Threading;
using System.Threading.Tasks;
using Cronos;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public abstract class CronJobService : IHostedService, IDisposable
    {
        private System.Timers.Timer _timer;
        private readonly CronExpression _expression;
        private readonly TimeZoneInfo _timeZoneInfo;
        protected readonly IServiceProvider _serviceProvider;
        private readonly string _systemEmail;
        private readonly string _adminEmail;
        private readonly string _sendGridApiKey;
        private readonly string _cronJobName;
        private readonly string _envName;


        protected CronJobService(string cronExpression, TimeZoneInfo timeZoneInfo, IServiceProvider serviceProvider, IOptions<AppSettings> optionAppSettings, string cronJobName, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env)
        {
            _expression = CronExpression.Parse(cronExpression);
            _timeZoneInfo = timeZoneInfo;
            _serviceProvider = serviceProvider;
            _systemEmail = optionAppSettings.Value.Common.SystemEmail;
            _adminEmail = optionAppSettings.Value.Common.AdminEmail;
            _sendGridApiKey = optionAppSettings.Value.Secrets.SendGridApiKey;
            _cronJobName = cronJobName;
            _envName = env.EnvironmentName;

        }

        public virtual async Task StartAsync(CancellationToken cancellationToken)
        {
            await ScheduleJob(cancellationToken);
        }

        protected virtual async Task ScheduleJob(CancellationToken cancellationToken)
        {
            var next = _expression.GetNextOccurrence(DateTimeOffset.Now, _timeZoneInfo);
            if (!next.HasValue)
            {
                sendEmailToAdmin(_cronJobName, "Get Next Occurrence error.");
                return;
            }

            var delay = next.Value - DateTimeOffset.Now;
            if (delay.TotalMilliseconds <= 0)   // prevent non-positive values from being passed into Timer
            {
                if (!cancellationToken.IsCancellationRequested)
                {
                    await DoWork(cancellationToken);
                }
                await ScheduleJob(cancellationToken);
            }
            else
            {
                _timer = new System.Timers.Timer(delay.TotalMilliseconds);
                _timer.Elapsed += async (sender, args) =>
                {
                    _timer.Dispose();  // reset and dispose timer
                    _timer = null;

                    if (!cancellationToken.IsCancellationRequested)
                    {
                        await DoWork(cancellationToken);
                    }

                    if (!cancellationToken.IsCancellationRequested)
                    {
                        await ScheduleJob(cancellationToken);    // reschedule next
                    }
                };

                _timer.Start();
            }

            await Task.CompletedTask;
        }

        public virtual async Task DoWork(CancellationToken cancellationToken)
        {
            await Task.Delay(5000, cancellationToken);  // do the work
        }

        public virtual async Task StopAsync(CancellationToken cancellationToken)
        {
            _timer?.Stop();
            await Task.CompletedTask;
        }

        public virtual void Dispose()
        {
            _timer?.Dispose();
        }

        public virtual async Task sendEmailToAdmin(string serviceName, string errorMessage)
        {
            await MailHelper.Send(MailProvider.SEND_GRID, new MailTemplate()
            {
                Subject = _envName + " CronJobs 發生錯誤: " + serviceName,
                Content = errorMessage
            }, _systemEmail, _adminEmail, _sendGridApiKey);
        }
    }

    public interface IScheduleConfig<T>
    {
        string CronExpression { get; set; }
        TimeZoneInfo TimeZoneInfo { get; set; }
    }

    public class ScheduleConfig<T> : IScheduleConfig<T>
    {
        public string CronExpression { get; set; }
        public TimeZoneInfo TimeZoneInfo { get; set; }
    }

    public static class ScheduledServiceExtensions
    {
        public static IServiceCollection AddCronJob<T>(this IServiceCollection services, Action<IScheduleConfig<T>> options) where T : CronJobService
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options), @"Please provide Schedule Configurations.");
            }
            var config = new ScheduleConfig<T>();
            options.Invoke(config);
            if (string.IsNullOrWhiteSpace(config.CronExpression))
            {
                throw new ArgumentNullException(nameof(ScheduleConfig<T>.CronExpression), @"Empty Cron Expression is not allowed.");
            }

            services.AddSingleton<IScheduleConfig<T>>(config);
            services.AddHostedService<T>();
            return services;
        }
    }
}
