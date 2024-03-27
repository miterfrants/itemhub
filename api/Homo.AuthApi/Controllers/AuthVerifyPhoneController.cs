using System;
using System.Net;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Swashbuckle.AspNetCore.Annotations;

using Homo.Core.Constants;
using Homo.Core.Helpers;
using Homo.Api;

namespace Homo.AuthApi
{
    [Route("v1/auth")]
    [SwaggerUiInvisibility]
    [Homo.Api.Validate]

    public class AuthVerifyPhoneController : ControllerBase
    {

        private readonly DBContext _dbContext;
        private readonly string _smsUsername;
        private readonly string _smsPassword;
        private readonly string _smsClientUrl;
        private readonly string _pkcs1PublicKeyPath;
        private readonly string _signUpJwtKey;
        private readonly string _phoneHashSalt;
        private readonly CommonLocalizer _commonLocalizer;
        private readonly string _testingPhone;

        public AuthVerifyPhoneController(DBContext dbContext, IOptions<AppSettings> appSettings, CommonLocalizer localizer)
        {
            Secrets secrets = (Secrets)appSettings.Value.Secrets;
            Common common = (Common)appSettings.Value.Common;
            _dbContext = dbContext;
            _smsUsername = secrets.SmsUsername;
            _smsPassword = secrets.SmsPassword;
            _smsClientUrl = common.SmsClientUrl;
            _signUpJwtKey = secrets.SignUpJwtKey;
            _pkcs1PublicKeyPath = common.Pkcs1PublicKeyPath;
            _commonLocalizer = localizer;
            _phoneHashSalt = secrets.PhoneHashSalt;
            _testingPhone = secrets.TestingPhone;

        }

        [SwaggerOperation(
            Tags = new[] { "註冊相關" },
            Summary = "寄送驗證簡訊",
            Description = ""
        )]
        [Route("send-sms")]
        [HttpPost]
        public async Task<dynamic> sendSms([FromBody] DTOs.SendSms dto, DTOs.JwtExtraPayload extraPayload)
        {
            string ip = NetworkHelper.GetIpFromRequest(Request);
            int countByIp = VerifyCodeDataservice.GetTodayCountByIp(_dbContext, ip);
            if (countByIp > 10)
            {
                throw new CustomException(ERROR_CODE.TOO_MANY_TIMES_TO_SEND_PHONE, HttpStatusCode.Forbidden);
            }

            string hashPhone = CryptographicHelper.GenerateSaltedHash(dto.Phone, _phoneHashSalt);
            User user = UserDataservice.GetOneByHashPhone(_dbContext, hashPhone);
            if (user != null)
            {
                throw new CustomException(ERROR_CODE.DUPLICATED_PHONE, HttpStatusCode.BadRequest);
            }

            int countByPhone = VerifyCodeDataservice.GetTodayCountByPhone(_dbContext, dto.Phone);
            if (countByPhone > 10)
            {
                throw new CustomException(ERROR_CODE.TOO_MANY_TIMES_TO_SEND_PHONE, HttpStatusCode.Forbidden);
            }

            string code = dto.Phone == _testingPhone ? "000000" : CryptographicHelper.GetSpecificLengthRandomString(6, false, true);

            VerifyCodeDataservice.Create(_dbContext, new DTOs.VerifyCode()
            {
                Phone = dto.Phone,
                Code = code,
                Expiration = DateTime.Now.AddSeconds(3 * 60),
                Ip = NetworkHelper.GetIpFromRequest(Request)
            });


            if (dto.Phone == _testingPhone)
            {
                return new { status = CUSTOM_RESPONSE.OK };
            }

            string message = _commonLocalizer.Get("sms template", null, new Dictionary<string, string>() { { "code", code } });
            await SmsHelper.Send(SmsProvider.Every8D, _smsUsername, _smsPassword, _smsClientUrl, dto.Phone, message);
            return new { status = CUSTOM_RESPONSE.OK };
        }
    }
}
