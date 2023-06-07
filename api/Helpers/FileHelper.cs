using System.Threading.Tasks;
using System.IO;

namespace Homo.IotApi
{
    public class FileHelper
    {
        public static async Task<dynamic> RecursiveCheckFileExists(string file)
        {
            bool isFileExists = System.IO.File.Exists(file);
            if (!isFileExists)
            {
                await Task.Delay(200);
                return await RecursiveCheckFileExists(file);
            }
            return Task.CompletedTask;
        }
    }
}
