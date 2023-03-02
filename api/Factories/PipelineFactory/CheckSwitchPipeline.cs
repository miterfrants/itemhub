using System.Threading.Tasks.Dataflow;
using Newtonsoft.Json;
using Homo.Core.Constants;
namespace Homo.IotApi
{
    public class CheckSwitchPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public CheckSwitchPipeline(IotDbContext dbContext, long ownerId, string rawData)
        {
            CheckSwitchPipeline.ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(previous =>
                            {
                                System.Console.WriteLine($"check switch:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }
                                var payload = CheckSwitchPipeline.ValidateAndGetPayload(rawData);
                                var pin = DevicePinDataservice.GetOne(dbContext, ownerId, payload.DeviceId.GetValueOrDefault(), PIN_TYPE.SWITCH, payload.Pin);
                                if (pin.Value == payload.Status)
                                {
                                    return true;
                                }
                                return false;
                            });
        }

        public static SwitchPipelinePayload ValidateAndGetPayload(string rawData)
        {
            var payload = JsonConvert.DeserializeObject<SwitchPipelinePayload>(rawData);
            if (payload.DeviceId == null)
            {
                throw new CustomException(ERROR_CODE.SWITCH_PIPELINE_INVALID_PAYLOAD_DEVICE_ID_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            if (System.String.IsNullOrEmpty(payload.Pin))
            {
                throw new CustomException(ERROR_CODE.SWITCH_PIPELINE_INVALID_PAYLOAD_PIN_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.Status == null)
            {
                throw new CustomException(ERROR_CODE.SWITCH_PIPELINE_INVALID_PAYLOAD_PIN_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            return payload;
        }
    }

    public class SwitchPipelinePayload
    {
        public long? DeviceId { get; set; }
        public string Pin { get; set; }

        public int? Status { get; set; }
    }
}