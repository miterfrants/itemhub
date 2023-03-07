using System;
using System.Threading.Tasks.Dataflow;
using Newtonsoft.Json;
using Homo.Core.Constants;
using Microsoft.EntityFrameworkCore;


namespace Homo.IotApi
{
    public class SensorPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public SensorPipeline(string DBConnectionString, long ownerId, string rawData)
        {
            ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(previous =>
                            {
                                System.Console.WriteLine($"sensor:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }
                                try
                                {
                                    var payload = ValidateAndGetPayload(rawData);
                                    DbContextOptionsBuilder<IotDbContext> dbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
                                    var mysqlVersion = new MySqlServerVersion(new Version(8, 0, 25));
                                    dbContextBuilder.UseMySql(DBConnectionString, mysqlVersion);
                                    var dbContext = new IotDbContext(dbContextBuilder.Options);
                                    decimal? categorizedValue = SensorLogDataservice.GetAggregateValue(dbContext, ownerId, payload.DeviceId.GetValueOrDefault(), payload.Pin, payload.StaticMethod.GetValueOrDefault(), 1, payload.LastRows.GetValueOrDefault());
                                    if (
                                        categorizedValue != null && (
                                        payload.Operator == TRIGGER_OPERATOR.B && categorizedValue > payload.Threshold
                                        || payload.Operator == TRIGGER_OPERATOR.BE && categorizedValue >= payload.Threshold
                                        || payload.Operator == TRIGGER_OPERATOR.E && categorizedValue == payload.Threshold
                                        || payload.Operator == TRIGGER_OPERATOR.L && categorizedValue < payload.Threshold
                                        || payload.Operator == TRIGGER_OPERATOR.LE && categorizedValue <= payload.Threshold
                                        )
                                    )
                                    {
                                        return true;
                                    }
                                    return false;
                                }
                                catch (System.Exception ex)
                                {
                                    System.Console.WriteLine($"Error When Sensor Pipeline:{Newtonsoft.Json.JsonConvert.SerializeObject(ex, Newtonsoft.Json.Formatting.Indented)}");
                                    throw;
                                }

                            });
        }

        public static SensorPipelinePayload ValidateAndGetPayload(string rawData)
        {
            if (System.String.IsNullOrEmpty(rawData))
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_PAYLOAD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            var payload = JsonConvert.DeserializeObject<SensorPipelinePayload>(rawData);
            if (payload.DeviceId == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_DEVICE_ID_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            if (System.String.IsNullOrEmpty(payload.Pin))
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_PIN_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.LastRows == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_LAST_ROWS_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.StaticMethod == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_STATIC_METHOD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.Operator == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_OPERATOR_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.Threshold == null)
            {
                throw new CustomException(ERROR_CODE.SENSOR_PIPELINE_INVALID_THRESHOLD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
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