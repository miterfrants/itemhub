using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;


namespace Homo.IotApi
{
    public class FilterRequestFactory : ActionFilterAttribute, IFilterFactory
    {
        public bool IsReusable => false;
        public FilterRequestFactory()
        {
        }
        public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
        {
            IOptions<Homo.IotApi.AppSettings> config = serviceProvider.GetService<IOptions<Homo.IotApi.AppSettings>>();
            var secrets = (Secrets)config.Value.Secrets;
            FilterRequestAttribute attribute = new FilterRequestAttribute(secrets.DBConnectionString, secrets.DashboardJwtKey);
            return attribute;
        }
    }
}