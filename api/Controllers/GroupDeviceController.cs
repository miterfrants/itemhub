using Microsoft.AspNetCore.Mvc;
using Homo.Core.Constants;
using Swashbuckle.AspNetCore.Annotations;
using System.Linq;
using System.IO;
using SixLabors.ImageSharp;
using Microsoft.Extensions.Options;

namespace Homo.IotApi
{
    [Route("v1/groups/{groupId}/devices")]
    [IotDashboardAuthorizeFactory()]
    [GroupAuthorizeFactory()]
    public class GroupDeviceController : ControllerBase
    {
        private readonly IotDbContext _dbContext;
        private readonly string _staticPath;

        public GroupDeviceController(IotDbContext dbContext, IOptions<AppSettings> appSettings)
        {
            _dbContext = dbContext;
            _staticPath = appSettings.Value.Common.StaticPath;
        }

        [SwaggerOperation(
            Tags = new[] { "群組管理" },
            Summary = "群組 - 取得群組裝置列表",
            Description = ""
        )]
        [HttpGet]
        public ActionResult<dynamic> getList([FromRoute] long groupId, [FromQuery] int limit, [FromQuery] int page, [FromQuery] string name, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            return new
            {
                devices = GroupDeviceDataservice.GetList(_dbContext, extraPayload.Id, groupId, name, page, limit).Select(x =>
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
                rowNum = GroupDeviceDataservice.GetRowNums(_dbContext, extraPayload.Id, groupId, name)
            }; ;
        }

        [SwaggerOperation(
            Tags = new[] { "群組管理" },
            Summary = "群組 - 取得單一裝置最後上線時間",
            Description = ""
        )]
        [Route("{deviceId}/last-activity")]
        [HttpGet]
        public ActionResult<dynamic> get([FromRoute] long groupId, [FromRoute] long deviceId, Homo.AuthApi.DTOs.JwtExtraPayload extraPayload)
        {
            long ownerId = extraPayload.Id;
            var groupDevice = GroupDeviceDataservice.GetOne(_dbContext, groupId, deviceId);
            DeviceActivityLog record = DeviceActivityLogDataservice.GetLast(_dbContext, groupDevice.UserId, deviceId);
            if (record == null)
            {
                throw new CustomException(Homo.AuthApi.ERROR_CODE.DATA_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
            }
            return record;
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
            DeviceUploadedImage record = DeviceUploadedImageDataservice.GetLastOne(_dbContext, ownerId, deviceId);
            if (record == null)
            {
                throw new CustomException(ERROR_CODE.FILE_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
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
            DeviceUploadedImage record = DeviceUploadedImageDataservice.GetLastOne(_dbContext, ownerId, deviceId);
            if (record == null)
            {
                throw new CustomException(ERROR_CODE.FILE_NOT_FOUND, System.Net.HttpStatusCode.NotFound);
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
