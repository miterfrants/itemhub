using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public class IotAuthorizeFactory : ActionFilterAttribute, IFilterFactory
    {
        public bool IsReusable => true;
        public IOT_ROLE[] _iotRoles;
        public AUTH_TYPE _authType = AUTH_TYPE.COMMON;
        public IotAuthorizeFactory(AUTH_TYPE type = AUTH_TYPE.COMMON, IOT_ROLE[] roles = null)
        {
            this._authType = type;
            this._iotRoles = roles == null ? new IOT_ROLE[] { IOT_ROLE.NO } : roles;
        }

        public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
        {
            IOptions<Homo.IotApi.AppSettings> config = serviceProvider.GetService<IOptions<Homo.IotApi.AppSettings>>();
            var secrets = (Secrets)config.Value.Secrets;
            return AuthorizeFactory.BuildAuthorizeAttribute(
                _iotRoles.Select(x => x.ToString()).ToArray()
                , config.Value.Common.AuthByCookie
                , _authType
                , secrets.JwtKey
                , secrets.SignUpJwtKey
                , secrets.AnonymousJwtKey
                , secrets.RefreshJwtKey);
        }
    }
}