using System;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Homo.IotApi
{
    public class GroupAuthorizeFactory : ActionFilterAttribute, IFilterFactory
    {
        public bool IsReusable => true;
        public GroupAuthorizeFactory()
        {
        }

        public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
        {
            IOptions<Homo.IotApi.AppSettings> config = serviceProvider.GetService<IOptions<Homo.IotApi.AppSettings>>();
            var secrets = (Secrets)config.Value.Secrets;
            var attribute = new GroupAuthorizeAttribute(secrets.DBConnectionString, secrets.DashboardJwtKey);
            return attribute;
        }
    }
}