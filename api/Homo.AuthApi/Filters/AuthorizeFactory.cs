using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;


namespace Homo.AuthApi
{
    public enum AUTH_TYPE
    {
        SIGN_UP,
        COMMON,
        ANONYMOUS,
        REFRESH
    }
    public class AuthorizeFactory : ActionFilterAttribute, IFilterFactory
    {
        public bool IsReusable => true;
        public AUTH_TYPE _authType = AUTH_TYPE.COMMON;
        public ROLE[] _roles;
        public AuthorizeFactory(AUTH_TYPE type = AUTH_TYPE.COMMON, ROLE[] roles = null)
        {
            this._authType = type;
            this._roles = roles == null ? new ROLE[] { ROLE.NO } : roles;
        }

        public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
        {
            IOptions<AppSettings> config = serviceProvider.GetService<IOptions<AppSettings>>();
            var secrets = (Secrets)config.Value.Secrets;
            AuthorizeAttribute attribute = BuildAuthorizeAttribute(
                _roles.Select(x => x.ToString()).ToArray()
                , config.Value.Common.AuthByCookie
                , _authType
                , secrets.JwtKey
                , secrets.SignUpJwtKey
                , secrets.AnonymousJwtKey
                , secrets.RefreshJwtKey);

            return attribute;
        }

        public static AuthorizeAttribute BuildAuthorizeAttribute(string[] roles, bool authByCookie, AUTH_TYPE authType, string commonJwtKey, string signUpJwtKey, string anonymousJwtKey, string refreshJwtKey)
        {
            AuthorizeAttribute attribute = new AuthorizeAttribute(roles);
            attribute.authByCookie = authByCookie;
            if (authType == AUTH_TYPE.COMMON)
            {
                attribute._jwtKey = commonJwtKey;
            }
            else if (authType == AUTH_TYPE.SIGN_UP)
            {
                attribute.isSignUp = true;
                attribute._jwtKey = signUpJwtKey;
            }
            else if (authType == AUTH_TYPE.ANONYMOUS)
            {
                attribute.isAnonymous = true;
                attribute._jwtKey = anonymousJwtKey;
            }
            else if (authType == AUTH_TYPE.REFRESH)
            {
                attribute._jwtKey = refreshJwtKey;
            }
            return attribute;
        }
    }
}