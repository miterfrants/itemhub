using System.Threading.Tasks.Dataflow;
using Newtonsoft.Json;
using Homo.Core.Constants;

namespace Homo.IotApi
{
    public class SensorPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public SensorPipeline(IotDbContext dbContext, long ownerId, string rawData)
        {
            ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(previous =>
                            {
                                if (!previous)
                                {
                                    return false;
                                }
                                var payload = ValidateAndGetPayload(rawData);
                                decimal? categorizedValue = categorizedValue = SensorLogDataservice.GetAggregateValue(dbContext, ownerId, payload.DeviceId.GetValueOrDefault(), payload.Pin, payload.StaticMethod.GetValueOrDefault(), 1, payload.LastRows.GetValueOrDefault()).Value;
                                if (
                                    payload.Operator == TRIGGER_OPERATOR.B && categorizedValue > payload.Threshold
                                    || payload.Operator == TRIGGER_OPERATOR.BE && categorizedValue >= payload.Threshold
                                    || payload.Operator == TRIGGER_OPERATOR.E && categorizedValue == payload.Threshold
                                    || payload.Operator == TRIGGER_OPERATOR.L && categorizedValue < payload.Threshold
                                    || payload.Operator == TRIGGER_OPERATOR.LE && categorizedValue <= payload.Threshold
                                )
                                {
                                    return true;
                                }
                                return false;
                            });
        }

        public static SensorPipelinePayload ValidateAndGetPayload(string rawData)
        {
            if (System.String.IsNullOrEmpty(rawData))
            {
                throw new CustomException(ERROR_CODE.PIPELINE_PAYLOAD_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            var payload = JsonConvert.DeserializeObject<SensorPipelinePayload>(rawData);
            if (payload.DeviceId == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_PAYLOAD_DEVICE_ID_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            if (System.String.IsNullOrEmpty(payload.Pin))
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_PAYLOAD_PIN_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.LastRows == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_PAYLOAD_LAST_ROWS_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.StaticMethod == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_PAYLOAD_STATIC_METHOD_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.Operator == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_PAYLOAD_OPERATOR_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.Threshold == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_PAYLOAD_THRESHOLD_IS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            return payload;
        }

    }

    public class SensorPipelinePayload
    {
        public long? DeviceId { get; set; }
        public string Pin { get; set; }

        public int? LastRows { get; set; }
        public PIPELINE_DEVICE_STATIC_METHODS? StaticMethod { get; set; }
        public TRIGGER_OPERATOR? Operator { get; set; }
        public decimal? Threshold { get; set; }
    }
}