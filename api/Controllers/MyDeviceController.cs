using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Homo.Api;
using Homo.Core.Constants;
using Homo.AuthApi;
using Swashbuckle.AspNetCore.Annotations;
using System.Linq;
using System.Net;
using System.IO;
using System;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Homo.IotApi
{
    [Route("v1/my/devices")]
    [IotDashboardAuthorizeFactory]
    [Validate]
    public class MyDeviceController : ControllerBase
    {
        private readonly IotDbContext _iotDbContext;
        private readonly DBContext _dbContext;
        private readonly string _dbConnectionString;
        private readonly Homo.Api.CommonLocalizer _commonLocalizer;
        private readonly string _adminEmail;
        private readonly string _mailTemplatePath;
        private readonly string _smsUsername;
        private readonly string _smsPassword;
        private readonly string _smsClientUrl;
        private readonly string _systemEmail;
        private readonly string _sendGridApiKey;
        private readonly string _mqttUsername;
        private readonly string _mqttPassword;
        private readonly string _serverId;
        private readonly string _webSiteUrl;
        private readonly string _staticPath;
        private readonly MySqlServerVersion _mysqlVersion;
        private readonly List<MqttPublisher> _localMqttPublishers;

        public MyDeviceController(IotDbContext iotDbContext, DBContext dbContext, IOptions<AppSettings> appSettings, Homo.Api.CommonLocalizer commonLocalizer, List<MqttPublisher> localMqttPublishers)
        {
            _iotDbContext = iotDbContext;
            _dbContext = dbContext;

            _dbConnectionString = appSettings.Value.Secrets.DBConnectionString;
            _commonLocalizer = commonLocalizer;
            _adminEmail = appSettings.Value.Common.AdminEmail;
            _mailTemplatePath = appSettings.Value.Common.StaticPath;
            _smsUsername = appSettings.Value.Secrets.SmsUsername;
            _smsPassword = appSettings.Value.Secrets.SmsPassword;
            _smsClientUrl = appSettings.Value.Common.SmsClientUrl;
            _systemEmail = appSettings.Value.Common.SystemEmail;
            _sendGridApiKey = appSettings.Value.Secrets.SendGridApiKey;
            _serverId = appSettings.Value.Common.ServerId;
            _staticPath = appSettings.Value.Common.StaticPath;

            _mqttUsername = appSettings.Value.Secrets.MqttUsername;
            _mqttPassword = appSettings.Value.Secrets.MqttPassword;
            _localMqttPublishers = localMqttPublishers;
            _webSiteUrl = appSettings.Value.Common.WebsiteUrl;
            _mysqlVersion = new MySqlServerVersion(new Version(8, 0, 25));

        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 取得分頁列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromQuery] int limit, [FromQuery] int page, [FromQuery] string name, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            List<Device> records = DeviceDataservice.GetList(_iotDbContext, ownerId, page, limit, name);
            return new
            {
                devices = records.Select(x =>
                new
                {
                    x.CreatedAt,
                    x.DeletedAt,
                    x.EditedAt,
                    x.Id,
                    x.Info,
                    x.Microcontroller,
                    x.Name,
                    x.Online,
                    x.OwnerId,
                    x.Protocol,
                    x.OfflineNotificationTarget,
                    x.IsOfflineNotification
                }),
                rowNum = DeviceDataservice.GetRowNum(_iotDbContext, ownerId, name)
            };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 取得列表",
            Description = ""
        )]
        [HttpGet]
        [Route("all")]
        public ActionResult<dynamic> getAll(Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            return DeviceDataservice.GetAll(_iotDbContext, ownerId, null);
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 建立新裝置",
            Description = ""
        )]
        [HttpPost]
        public ActionResult<dynamic> create([FromBody] DTOs.DevicePayload dto, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload, bool isVIP)
        {
            long ownerId = extraPayload.Id;
            Subscription subscription = SubscriptionDataservice.GetCurrnetOne(_iotDbContext, ownerId);
            int subscriptionLevel = subscription == null ? -1 : subscription.PricingPlan;
            decimal deviceCountInPricingPlan = subscriptionLevel == -1 ? 2 : SubscriptionHelper.GetDeviceCount((PRICING_PLAN)subscription.PricingPlan);
            decimal currentDeviceCount = DeviceDataservice.GetRowNum(_iotDbContext, ownerId, null);

            if ((currentDeviceCount + 1 > deviceCountInPricingPlan) && !isVIP)
            {
                var pricingPlans = ConvertHelper.EnumToList(typeof(PRICING_PLAN));
                string reason = "";
                if (subscriptionLevel + 1 > pricingPlans.Count - 1)
                {
                    reason = _commonLocalizer.Get("moreThanMaxNumberOfDeviceInAnyPlan", null, new Dictionary<string, string>() { { "adminEmail", _adminEmail } });
                }
                else
                {
                    decimal deviceCountInNextLevelPricingPlan = SubscriptionHelper.GetDeviceCount((PRICING_PLAN)(subscriptionLevel + 1));
                    reason = _commonLocalizer.Get("moreThanMaxNumberOfDevice", null, new Dictionary<string, string>() { { "deviceCountInNextLevelPricingPlan", deviceCountInNextLevelPricingPlan.ToString() } });
                }

                throw new CustomException(ERROR_CODE.OVER_PRICING_PLAN, System.Net.HttpStatusCode.Forbidden, new Dictionary<string, string>(){{
                    "reason", reason
                }});
            }

            Device rewRecord = DeviceDataservice.Create(_iotDbContext, ownerId, dto);
            return rewRecord;
        }


        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 批次刪除裝置",
            Description = ""
        )]
        [HttpDelete]
        public ActionResult<dynamic> batchDelete([FromBody] List<long> ids, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            DeviceDataservice.BatchDelete(_iotDbContext, ownerId, ids);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 取得單一裝置",
            Description = ""
        )]
        [HttpGet]
        [Route("{id}")]
        public ActionResult<dynamic> getOne([FromRoute] int id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            Device record = DeviceDataservice.GetOne(_iotDbContext, ownerId, id);
            if (record == null)
            {
                throw new CustomException(Homo.AuthApi.ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }
            return record;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 取得單一裝置最後上線時間",
            Description = ""
        )]
        [HttpGet]
        [Route("{id}/last-activity")]
        public ActionResult<dynamic> getLastActivity([FromRoute] int id, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            DeviceActivityLog record = DeviceActivityLogDataservice.GetLast(_iotDbContext, ownerId, id);
            if (record == null)
            {
                throw new CustomException(Homo.AuthApi.ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }
            return record;
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 更新單一裝置基本資料",
            Description = ""
        )]
        [HttpPatch]
        [Route("{id}")]
        public ActionResult<dynamic> update([FromRoute] int id, [FromBody] DTOs.DevicePayload dto, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            bool isVIP = RelationOfGroupAndUserDataservice.IsVIP(_dbContext, ownerId);
            var subscrioption = SubscriptionDataservice.GetCurrnetOne(_iotDbContext, ownerId);
            if (
                dto.IsOfflineNotification == true && dto.OfflineNotificationTarget.Length > 0
                && !isVIP && subscrioption == null
            )
            {
                throw new CustomException(ERROR_CODE.OFFLINE_NOTIFICATION_USAGE_LIMIT);
            }
            DeviceDataservice.Update(_iotDbContext, ownerId, id, dto);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 刪除單一裝置",
            Description = ""
        )]
        [HttpDelete]
        [Route("{id}")]
        public ActionResult<dynamic> delete([FromRoute] long id, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            DeviceDataservice.Delete(_iotDbContext, ownerId, id);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 切換裝置狀態",
            Description = ""
        )]
        [HttpPost]
        [Route("{id}/online")]
        public ActionResult<dynamic> online([FromRoute] long id, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            DeviceStateHelper.Create(_iotDbContext, _dbConnectionString, _serverId, ownerId, id, _commonLocalizer, _mailTemplatePath, _systemEmail, _sendGridApiKey, _smsClientUrl, _smsUsername, _smsPassword, _mqttUsername, _mqttPassword, _localMqttPublishers, _webSiteUrl, _adminEmail);
            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 上傳圖片檔案",
            Description = ""
        )]
        [HttpPost]
        [Route("{id}/upload-file")]
        public async Task<dynamic> uploadFile([FromRoute] long id, dynamic extraPayload)
        {
            if (Request.ContentType.IndexOf("multipart/form-data") == -1)
            {
                throw new CustomException(ERROR_CODE.UNSUPPORT_MEDIA_TYPE, HttpStatusCode.UnsupportedMediaType);
            }

            long ownerId = extraPayload.Id;

            var device = DeviceDataservice.GetOne(_iotDbContext, ownerId, id);
            if (device == null)
            {
                throw new CustomException(ERROR_CODE.DEVICE_NOT_FOUND, HttpStatusCode.NotFound);
            }

            string destinationalFilename = "";
            DateTime now = DateTime.Now;
            string folder = $"{_staticPath}/private/{now.ToString("yyyyMMdd")}/{ownerId}/{id}";

            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }

            decimal todayUploadedSize = Directory.GetFiles(folder).Sum(fi => fi.Length);
            if (todayUploadedSize / 100 > 100)
            {
                throw new CustomException(ERROR_CODE.MAX_UPLOAD_SIZE_PER_DAILY, HttpStatusCode.FailedDependency);
            }

            string filename = now.ToString("yyyyMMddHHmmssfff");
            string ext = "";

            if (Request.Form.Files.Count > 1)
            {
                throw new CustomException(ERROR_CODE.CAN_UPLOAD_ONLY_ONE_FILE, HttpStatusCode.BadRequest);
            }

            IFormFile file = Request.Form.Files[0];
            ext = Path.GetExtension(file.FileName);
            if (!new List<string> { ".jpeg", ".png", ".jpg", ".gif" }.Contains(ext))
            {
                throw new CustomException(ERROR_CODE.INVALID_FILE_EXT, HttpStatusCode.BadRequest);
            }

            destinationalFilename = $"{folder}/{filename}{ext}";
            FileStream filestream = new FileStream(destinationalFilename, FileMode.Create);
            file.CopyTo(filestream);
            filestream.Close();
            filestream.Dispose();

            if (ext == ".png" || ext == ".jpg" || ext == ".jpeg")
            {
                using var image = Image.Load(destinationalFilename);
                image.Mutate(x => x.Resize(image.Width * 3 / 100, image.Height * 3 / 100));
                image.Save($"{folder}/{filename}-thumbnail{ext}");
            }


            Task.Run(async () =>
            {
                // waiting file write finish
                await FileHelper.RecursiveCheckFileExists($"{folder}/{filename}-thumbnail{ext}");
                await FileHelper.RecursiveCheckFileExists($"{folder}/{filename}{ext}");
                DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
                iotBuilder.UseMySql(_dbConnectionString, _mysqlVersion);
                var iotDbContext = new IotDbContext(iotBuilder.Options);

                // save filename to database
                DeviceUploadedImageDataservice.Create(iotDbContext, ownerId, id, new DTOs.DeviceUploadedImage()
                {
                    OwnerId = ownerId,
                    DeviceId = id,
                    Filename = $"{filename}{ext}"
                });
            });

            return new { status = CUSTOM_RESPONSE.OK };
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 取得最後上傳檔案",
            Description = ""
        )]
        [HttpGet]
        [Route("{deviceId}/read-last-file")]
        public ActionResult<dynamic> readLastFile([FromRoute] long deviceId, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            DeviceUploadedImage record = DeviceUploadedImageDataservice.GetLastOne(_iotDbContext, ownerId, deviceId);
            if (record == null)
            {
                throw new CustomException(ERROR_CODE.FILE_NOT_FOUND, HttpStatusCode.NotFound);
            }
            string folder = $"{_staticPath}/private/{record.Filename.Substring(0, 8)}/{ownerId}/{deviceId}";
            var image = Image.Load($"{folder}/{record.Filename}");

            Stream outputStream = new MemoryStream();

            if (record.Filename.EndsWith("jpg") || record.Filename.EndsWith("jpeg"))
            {
                image.SaveAsJpeg(outputStream);
                outputStream.Position = 0;
                return File(outputStream, "image/jpeg");
            }
            else if (record.Filename.EndsWith("png"))
            {
                image.SaveAsPng(outputStream);
                outputStream.Position = 0;
                return File(outputStream, "image/png");
            }
            return File(outputStream, "image/*");
        }

        [SwaggerOperation(
            Tags = new[] { "裝置相關" },
            Summary = "裝置 - 取得最後上傳檔案的縮圖",
            Description = ""
        )]
        [HttpGet]
        [Route("{deviceId}/read-last-file-thumbnail")]
        public ActionResult<dynamic> readFileThumbnail([FromRoute] long deviceId, dynamic extraPayload)
        {
            long ownerId = extraPayload.Id;
            DeviceUploadedImage record = DeviceUploadedImageDataservice.GetLastOne(_iotDbContext, ownerId, deviceId);
            if (record == null)
            {
                throw new CustomException(ERROR_CODE.FILE_NOT_FOUND, HttpStatusCode.NotFound);
            }

            string ext = Path.GetExtension(record.Filename);
            string filename = Path.GetFileNameWithoutExtension(record.Filename);
            string folder = $"{_staticPath}/private/{record.Filename.Substring(0, 8)}/{ownerId}/{deviceId}";
            var image = Image.Load($"{folder}/{filename}-thumbnail{ext}");

            Stream outputStream = new MemoryStream();

            if (record.Filename.EndsWith("jpg") || record.Filename.EndsWith("jpeg"))
            {
                image.SaveAsJpeg(outputStream);
                outputStream.Position = 0;
                return File(outputStream, "image/jpeg");
            }
            else if (record.Filename.EndsWith("png"))
            {
                image.SaveAsPng(outputStream);
                outputStream.Position = 0;
                return File(outputStream, "image/png");
            }
            return File(outputStream, "image/*");
        }
    }
}
