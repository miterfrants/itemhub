using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace Homo.AuthApi
{
    public class JWTHelper
    {
        public static string GenerateToken(string key, int expirationMinutes = 1, dynamic extraPayload = null, string[] roles = null)
        {
            var expirationTime = DateTime.Now.ToUniversalTime().AddMinutes(expirationMinutes);
            Int32 unixTimestamp = (Int32)(expirationTime.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var signingCredentials = new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256);

            var header = new JwtHeader(signingCredentials);

            var payload = new JwtPayload {
                { "extra", extraPayload }
                , { "exp", unixTimestamp }
                , {"roles", roles}
            };

            var secretToken = new JwtSecurityToken(header, payload);
            var handler = new JwtSecurityTokenHandler();
            var tokenString = handler.WriteToken(secretToken);
            return tokenString;
        }

        public static bool isExpired(string token)
        {
            var payload = JWTHelper.DecodeToken<dynamic>(token);
            Int32 currentUnixTimestamp = (Int32)(DateTime.Now.ToUniversalTime().Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            if (payload.exp < currentUnixTimestamp)
            {
                return true;
            }
            return false;
        }

        public static dynamic DecodeToken<T>(string token)
        {
            JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();
            return JsonConvert.DeserializeObject<T>(handler.ReadJwtToken(token).Payload.SerializeToJson());
        }

        public static DTOs.JwtExtraPayload GetExtraPayload(string key, string token)
        {
            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();


            try
            {
                JwtSecurityToken jwtToken = (JwtSecurityToken)tokenHandler.ReadToken(token);
                byte[] byteArrayOfKey = Encoding.UTF8.GetBytes(key);
                TokenValidationParameters parameters = new TokenValidationParameters()
                {
                    TryAllIssuerSigningKeys = true,
                    RequireExpirationTime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(byteArrayOfKey),
                    ValidateAudience = false,
                    ValidateIssuer = false,
                };
                SecurityToken securityToken;

                ClaimsPrincipal payload = tokenHandler.ValidateToken(token,
                    parameters, out securityToken);

                return JsonConvert.DeserializeObject<DTOs.JwtExtraPayload>(payload.FindFirstValue("extra"));
            }
            catch (SystemException)
            {
                return null;
            }
        }

        public static ClaimsPrincipal GetPayload(string key, string token)
        {
            try
            {
                JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
                JwtSecurityToken jwtToken = (JwtSecurityToken)tokenHandler.ReadToken(token);
                byte[] byteArrayOfKey = Encoding.UTF8.GetBytes(key);
                TokenValidationParameters parameters = new TokenValidationParameters()
                {
                    RequireExpirationTime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(byteArrayOfKey),
                    ValidateAudience = false,
                    ValidateIssuer = false,
                };
                SecurityToken securityToken;
                ClaimsPrincipal payload = tokenHandler.ValidateToken(token,
                    parameters, out securityToken);
                return payload;
            }
            catch (System.Exception)
            {
                return null;
            }
        }

        public static long? GetUserIdFromRequest(string key, Microsoft.AspNetCore.Http.HttpRequest Request)
        {
            string token = "";
            Request.Cookies.TryGetValue("token", out token);
            if (token == null || token == "")
            {
                string authorization = Request.Headers["Authorization"];
                token = authorization.Substring("Bearer ".Length).Trim();
            }
            DTOs.JwtExtraPayload extraPayload = JWTHelper.GetExtraPayload(key, token);
            if (extraPayload == null)
            {
                return null;
            }
            return (long?)extraPayload.Id;
        }
    }
}