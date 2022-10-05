using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using System.IO;
using Homo.Api;
using Homo.Core.Constants;
using Homo.Core.Helpers;
using Swashbuckle.AspNetCore.Annotations;

namespace Homo.IotApi
{
    [Route("v1/my/devices")]
    [IotDashboardAuthorizeFactory]
    [SwaggerUiInvisibility]
    [Validate]
    public class MyDeviceFirmwareController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        readonly string _firmwareTemplatePath;
        readonly string _staticPath;
        readonly string _dbc;
        public MyDeviceFirmwareController(IotDbContext dbContext, IOptions<AppSettings> appSettings)
        {
            _dbContext = dbContext;
            _firmwareTemplatePath = appSettings.Value.Common.FirmwareTemplatePath;
            _staticPath = appSettings.Value.Common.StaticPath;
            _dbc = appSettings.Value.Secrets.DBConnectionString;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 打包裝置韌體",
            Description = ""
        )]
        [Route("{id}/bundle-firmware")]
        [HttpPost]
        public ActionResult<dynamic> generate([FromRoute] long id, DTOs.Firmware dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            // validation 
            Device device = DeviceDataservice.GetOne(_dbContext, extraPayload.Id, id);
            if (device == null)
            {
                throw new CustomException(ERROR_CODE.DEVICE_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }

            if (device.Microcontroller == null)
            {
                throw new CustomException(ERROR_CODE.DEIVCE_WITHOUT_MCU, System.Net.HttpStatusCode.Forbidden);
            }

            // delete exists oAuthClient
            OauthClientDataservice.DeleteByDeviceId(_dbContext, extraPayload.Id, id);

            // create oAuthClient
            string clientSecret = CryptographicHelper.GetSpecificLengthRandomString(64, true, false);
            string salt = CryptographicHelper.GetSpecificLengthRandomString(128, false, false);
            string hashClientSecrets = CryptographicHelper.GenerateSaltedHash(clientSecret, salt);
            string randomClientId = CryptographicHelper.GetSpecificLengthRandomString(64, true, false);

            OauthClient client = OauthClientDataservice.Create(_dbContext, extraPayload.Id, new DTOs.OauthClient()
            {
                ClientId = randomClientId,
                DeviceId = id
            }, hashClientSecrets, salt);

            // create bundle log
            string randomBundleId = CryptographicHelper.GetSpecificLengthRandomString(32, true, false);
            FirmwareBundleLogDataservice.Create(_dbContext, extraPayload.Id, id, randomBundleId, device.Protocol);

            // pass client id, client secrets and bundle id to asyn bundle firmware function
            string bundleName = FirmwareGenerateService.Generate(_dbc, _firmwareTemplatePath, _staticPath, id, extraPayload.Id, randomClientId, clientSecret, randomBundleId, dto.ZipPassword, device.Protocol);

            Response.Headers.Add("Access-Control-Expose-Headers", "Content-Disposition");
            var buffer = System.IO.File.ReadAllBytes($"{_staticPath}/firmware/{bundleName}.zip");
            MemoryStream stream = new MemoryStream(buffer);
            stream.Seek(0, SeekOrigin.Begin);
            FileStreamResult result;
            result = new FileStreamResult(stream, new MediaTypeHeaderValue("application/zip"));
            result.FileDownloadName = $"{device.Name ?? randomBundleId}.zip";
            return result;
        }

    }
}
