using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Homo.Core.Constants;
namespace Homo.IotApi
{
    public class DelayPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public DelayPipeline(string rawData)
        {
            ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(async previous =>
                            {
                                System.Console.WriteLine($"delay:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }
                                int minutes = ValidateAndGetPayload(rawData);
                                await Task.Delay(minutes * 60 * 1000);
                                return true;
                            });
        }

        public static int ValidateAndGetPayload(string rawData)
        {
            if (System.String.IsNullOrEmpty(rawData))
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_PAYLOAD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            int minutes = 0;
            bool isValid = System.Int32.TryParse(rawData, out minutes);
            if (!isValid)
            {
                throw new CustomException(ERROR_CODE.DELAY_PIPELINE_INVALID, System.Net.HttpStatusCode.BadRequest);
            }
            return minutes;
        }
    }

}