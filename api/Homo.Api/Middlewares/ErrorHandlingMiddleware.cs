using System;
using System.Net;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Sentry;
using Homo.Core.Constants;
using Homo.AuthApi;

namespace Homo.Api
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate next;
        private string envName;
        protected IServiceProvider _serviceProvider;
        public ErrorHandlingMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        public async Task Invoke(HttpContext context, IWebHostEnvironment env, IServiceProvider serviceProvider)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                envName = env.EnvironmentName;
                _serviceProvider = serviceProvider;
                IOptions<AppSettings> config = _serviceProvider.GetService<IOptions<AppSettings>>();
                ErrorMessageLocalizer localizer = _serviceProvider.GetService<ErrorMessageLocalizer>();
                HandleExceptionAsync(context, ex, config, localizer);
            }
        }

        protected virtual ActionResult<dynamic> HandleExceptionAsync(HttpContext context, Exception ex, IOptions<IAppSettings> config, ErrorMessageLocalizer localizer)
        {
            var appSettings = JsonConvert.DeserializeObject<AppSettings>(JsonConvert.SerializeObject(config.Value));
            string localizationResourcesPath = appSettings.Common.LocalizationResourcesPath;
            var code = HttpStatusCode.InternalServerError;
            string errorKey = "";
            string internalErrorMessage = "";
            if (envName != "dev" && envName != "Development")
            {
                internalErrorMessage = System.Web.HttpUtility.JavaScriptStringEncode(ex.Message);
            }
            else
            {
                internalErrorMessage = System.Web.HttpUtility.JavaScriptStringEncode(ex.ToString());
            }

            long? userId = null;
            string token = "";
            string authorization = context.Request.Headers["Authorization"];
            token = authorization == null ? "" : authorization.Substring("Bearer ".Length).Trim();
            var appSetting = (dynamic)config.Value;

            if (token != null && token.Length > 0 && appSetting.Secrets != null && appSetting.Secrets.JwtKey != null)
            {
                try
                {
                    dynamic extraPayload = JWTHelper.GetExtraPayload(appSetting.Secrets.JwtKey, token);
                    userId = extraPayload.Id;

                }
                catch (System.Exception parseTokenEx)
                {
                    SendErrorToSentry(parseTokenEx, context.Request.Body, context.Request.QueryString, null);
                }
            }

            SendErrorToSentry(ex, context.Request.Body, context.Request.QueryString, userId);
            System.Console.WriteLine($"Error: {Newtonsoft.Json.JsonConvert.SerializeObject(ex.ToString(), Newtonsoft.Json.Formatting.Indented)}");

            Dictionary<string, dynamic> payload = null;
            if (ex.GetType() == typeof(Homo.Core.Constants.CustomException))
            {
                var customEx = (Homo.Core.Constants.CustomException)ex;
                if (customEx.code != HttpStatusCode.OK)
                {
                    code = customEx.code;
                }

                errorKey = customEx.errorCode.ToString();
                internalErrorMessage = localizer.Get(customEx.errorCode);

                if (customEx.option != null)
                {
                    foreach (string key in customEx.option.Keys)
                    {
                        string value = "";
                        customEx.option.TryGetValue(key, out value);
                        internalErrorMessage = internalErrorMessage.Replace("{" + key + "}", value);
                    }
                }
                payload = customEx.payload;
            }
            var result = new { message = internalErrorMessage, errorKey = errorKey, payload = payload };
            try
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)code.GetHashCode();
            }
            catch (System.Exception exInner)
            {
                throw new Exception(ex.ToString() + exInner.ToString());
            }
            return context.Response.WriteAsync(JsonConvert.SerializeObject(result));
        }

        private async Task SendErrorToSentry(Exception ex, System.IO.Stream reqBody = null, QueryString queryString = default(QueryString), long? userId = null)
        {
            if (ex.GetType() == typeof(CustomException))
            {
                var customEx = (CustomException)ex;
                if (customEx.errorCode == Homo.IotApi.ERROR_CODE.OVER_PRICING_PLAN)
                {
                    return;
                }
                string internalErrorMessage = customEx.errorCode;
                Exception newEx = new Exception(internalErrorMessage, customEx);
                SentrySdk.CaptureException(newEx);
            }
            else
            {
                bool excludeError = ex.Message.Contains("Token does not have a kid.");
                if (excludeError)
                {
                    return;
                }
                SentrySdk.CaptureException(ex);

            }
        }
    }
}
