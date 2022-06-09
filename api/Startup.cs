using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Globalization;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Linq;
using Homo.Api;

namespace Homo.IotApi
{
    public class Startup
    {
        Microsoft.AspNetCore.Hosting.IWebHostEnvironment _env;
        public Startup(IConfiguration configuration, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env)
        {
            Console.WriteLine(env.EnvironmentName);
            _env = env;
            string secretsFilename = "secrets.json";
            if (_env.EnvironmentName == "migration") // 測試環境必須要有 secrets.migration.json 才有辦法透過 webhook-deployment 來做 production db migration
            {
                secretsFilename = "secrets.migration.json";
            }

            System.Text.Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile(secretsFilename, optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
            EnvService.Set(env);
        }

        public IConfiguration Configuration { get; }
        readonly string AllowSpecificOrigins = "";

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            AppSettings appSettings = new AppSettings();
            Configuration.GetSection("Config").Bind(appSettings);
            services.Configure<AppSettings>(Configuration.GetSection("Config"));
            services.Configure<Homo.AuthApi.AppSettings>(Configuration.GetSection("Config"));

            // setup CROS if config file includ CROS section
            IConfigurationSection CROSSection = Configuration.GetSection("CROS");

            string stringCrossOrigins = Configuration.GetSection("CROS").GetValue<string>("Origin");
            if (stringCrossOrigins != null)
            {
                string[] crossOrigins = stringCrossOrigins.Split(",");
                Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(crossOrigins));

                services.AddCors(options =>
                {
                    options.AddPolicy(AllowSpecificOrigins,
                        builder =>
                        {
                            builder.WithOrigins(crossOrigins)
                                .AllowAnyHeader()
                                .AllowAnyMethod()
                                .AllowCredentials()
                                .SetPreflightMaxAge(TimeSpan.FromSeconds(600));
                        });
                });
            }
            CultureInfo currentCultureInfo = System.Threading.Thread.CurrentThread.CurrentCulture;
            services.AddSingleton<ErrorMessageLocalizer>(new ErrorMessageLocalizer(appSettings.Common.LocalizationResourcesPath));
            services.AddSingleton<CommonLocalizer>(new CommonLocalizer(appSettings.Common.LocalizationResourcesPath));
            services.AddSingleton<ValidationLocalizer>(new ValidationLocalizer(appSettings.Common.LocalizationResourcesPath));
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            var secrets = (Homo.IotApi.Secrets)appSettings.Secrets;
            services.AddDbContext<IotDbContext>(options => options.UseMySql(secrets.DBConnectionString, serverVersion));
            services.AddDbContext<Homo.AuthApi.DBContext>(options => options.UseMySql(secrets.DBConnectionString, serverVersion));
            if (_env.EnvironmentName.ToLower() != "dev" && _env.EnvironmentName.ToLower() != "migration")
            {
                StartupOfflineService.OfflineTooLongNoActivityDevice(secrets.DBConnectionString);
            }

            services.AddControllers();
            if (_env.EnvironmentName.ToLower() != "dev")
            {
                services.AddCronJob<AutoPaymentCronJob>(c =>
                {
                    c.TimeZoneInfo = TimeZoneInfo.Local;
                    c.CronExpression = @"30 1 * * *";
                });
            }

            services.AddCronJob<ClearTriggerLogCronJob>(c =>
                {
                    c.TimeZoneInfo = TimeZoneInfo.Local;
                    c.CronExpression = @"0 0 * * *";
                });

            services.AddCronJob<DeviceActivityLogCronJobService>(c =>

                {
                    c.TimeZoneInfo = TimeZoneInfo.Local;
                    c.CronExpression = @"0 0 * * *";
                });

            services.AddCronJob<ClearExpiredDevicePinSensorDataCronJobService>(c =>
                {
                    c.TimeZoneInfo = TimeZoneInfo.Local;
                    c.CronExpression = @"0 0 * * *";
                });

            services.AddCronJob<SendOverPlanNotificationCronJobService>(c =>
                {
                    c.TimeZoneInfo = TimeZoneInfo.Local;
                    c.CronExpression = @"0 0 * * *";
                });

            services.AddSwaggerGen(c =>
            {
                c.EnableAnnotations();
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo() { Title = "ItemHub API 文件", Version = "v1" });
                c.OperationFilter<OpenApiParameterIgnoreFilter>();
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please insert JWT with Bearer into field",
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement {
                    {
                        new OpenApiSecurityScheme
                        {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                        },
                        new string[] { }
                        }
                    });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.DocumentTitle = "Itemhub API";
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "itemhub api v1");
                c.DefaultModelsExpandDepth(-1);
            });

            var supportedCultures = new[] {
                new CultureInfo("zh-TW"),
                new CultureInfo("en-US"),
                new CultureInfo("fr"),
            };

            app.UseRequestLocalization(new RequestLocalizationOptions
            {
                DefaultRequestCulture = new RequestCulture("zh-TW"),
                SupportedCultures = supportedCultures,
                SupportedUICultures = supportedCultures,
                RequestCultureProviders = new List<IRequestCultureProvider>
                {
                    new QueryStringRequestCultureProvider{QueryStringKey= "culture"}
                }
            });

            String apiPrefix = Configuration.GetSection("Config").GetSection("Common").GetValue<string>("ApiPrefix");
            app.UseCors(AllowSpecificOrigins);
            app.UseHttpsRedirection();
            app.UsePathBase(new PathString($"/{apiPrefix}"));
            app.UseRouting();
            app.UseMiddleware(typeof(IotApiErrorHandlingMiddleware));
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}