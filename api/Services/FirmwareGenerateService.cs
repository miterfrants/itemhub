using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

using Microsoft.EntityFrameworkCore;

using Homo.Core.Helpers;
using Ionic.Zip;

namespace Homo.IotApi
{
    public static class FirmwareGenerateService
    {
        public static string Generate(
            string dbc,
            string firmwareTemplatePath,
            string staticPath,
            long deviceId,
            long ownerId,
            string clientId,
            string clientSecret,
            string bundleId,
            string zipPassword
        )
        {
            DbContextOptionsBuilder<IotDbContext> builder = new DbContextOptionsBuilder<IotDbContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            builder.UseMySql(dbc, serverVersion);
            IotDbContext dbContext = new IotDbContext(builder.Options);

            Device device = DeviceDataservice.GetOne(dbContext, ownerId, deviceId);
            List<DTOs.DevicePin> devicePins = DevicePinDataservice.GetAll(dbContext, ownerId, new List<long> { deviceId }, null, null);
            if (device.Microcontroller == null)
            {
                // no microcontroller
                // todo: manually throw a error to error platform
            }

            Microcontroller mcu = MicrocontrollerDataservice.GetOne(dbContext, device.Microcontroller.GetValueOrDefault());
            string mcuName = mcu.Key.ToString().ToLower().Replace("_", "-");

            string microcontrollerFirmwareTemplatePath = $"{firmwareTemplatePath}/{mcuName}/http";
            string folderName = CryptographicHelper.GetSpecificLengthRandomString(32, true, false);
            string firmwareZipPath = $"{staticPath}/firmware/{folderName}.zip";
            string destPath = $"{staticPath}/firmware/{folderName}/{folderName}";
            string zipSourcePath = $"{staticPath}/firmware/{folderName}";
            string sourceInoPath = $"{destPath}/{mcuName}.ino";
            string inoPath = $"{destPath}/{folderName}.ino";

            // copy to static 
            CopyDirectory(microcontrollerFirmwareTemplatePath, destPath, true);
            string pinTemplate = "pins.push_back(ItemhubPin({PIN_NUMBER}, \"{PIN_STRING}\", {PIN_MODE}))";
            List<string> pins = new List<string>();

            devicePins.ForEach(item =>
            {
                string pinString = item.Pin;
                string pinValue = item.PinNumber;
                pins.Add(pinTemplate.Replace("{PIN_NUMBER}", pinValue).Replace("{PIN_STRING}", pinString).Replace("{PIN_MODE}", item.Mode.ToString()));
            });

            string inoTemplate = System.IO.File.ReadAllText(sourceInoPath);
            inoTemplate = inoTemplate.Replace("{CLIENT_ID}", clientId);
            inoTemplate = inoTemplate.Replace("{CLIENT_SECRET}", clientSecret);
            inoTemplate = inoTemplate.Replace("{PINS}", String.Join(";", pins));

            System.IO.File.WriteAllText(inoPath, inoTemplate);
            System.IO.File.Delete(sourceInoPath);

            // zip
            var zipFile = new ZipFile();
            if (!String.IsNullOrEmpty(zipPassword))
            {
                zipFile.Password = zipPassword;
            }

            zipFile.AddDirectory(zipSourcePath);
            zipFile.Save(firmwareZipPath);

            // archived source firmware
            System.IO.Directory.Move(zipSourcePath, $"{staticPath}/archived/{folderName}");

            // countdown 10 mins then remove zip file
            var tokenSource = new CancellationTokenSource();
            CancellationToken cancellationToken = tokenSource.Token;
            var task = Task.Run(async () =>
            {
                await Task.Delay(10 * 60 * 1000);
                if (cancellationToken.IsCancellationRequested)
                {
                    return;
                }

                System.IO.File.Delete(firmwareZipPath);
            }, tokenSource.Token);

            // update firmware bundle log
            FirmwareBundleLogDataservice.UpdateFirmwareFile(dbContext, folderName, bundleId);
            return folderName;
        }
        private static void CopyDirectory(string sourceDir, string destinationDir, bool recursive)
        {
            // Get information about the source directory
            var dir = new DirectoryInfo(sourceDir);

            // Check if the source directory exists
            if (!dir.Exists)
                throw new DirectoryNotFoundException($"Source directory not found: {dir.FullName}");

            // Cache directories before we start copying
            DirectoryInfo[] dirs = dir.GetDirectories();

            // Create the destination directory
            Directory.CreateDirectory(destinationDir);

            // Get the files in the source directory and copy to the destination directory
            foreach (FileInfo file in dir.GetFiles())
            {
                string targetFilePath = Path.Combine(destinationDir, file.Name);
                file.CopyTo(targetFilePath);
            }

            // If recursive and copying subdirectories, recursively call this method
            if (recursive)
            {
                foreach (DirectoryInfo subDir in dirs)
                {
                    string newDestinationDir = Path.Combine(destinationDir, subDir.Name);
                    CopyDirectory(subDir.FullName, newDestinationDir, true);
                }
            }
        }
    }
}
