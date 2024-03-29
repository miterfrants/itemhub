using System;
using System.Threading.Tasks.Dataflow;
using System.Net.Http;
using Newtonsoft.Json;
using Homo.Core.Constants;
using Microsoft.EntityFrameworkCore;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public class NetworkPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public NetworkPipeline(long id, long pipelineId, long ownerId, string DBConnectionString, bool isHead, bool isEnd, bool isVIP, string rawData)
        {
            ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(async previous =>
                            {
                                System.Console.WriteLine($"network:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }

                                var payload = ValidateAndGetPayload(rawData);

                                var mysqlVersion = new MySqlServerVersion(new Version(8, 0, 25));
                                DbContextOptionsBuilder<IotDbContext> IotDbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
                                IotDbContextBuilder.UseMySql(DBConnectionString, mysqlVersion);
                                using (var iotDbContext = new IotDbContext(IotDbContextBuilder.Options))
                                {
                                    if (!isVIP && isHead && RateLimitDataservice.IsPipelineExecuteLogOverPricingPlan(iotDbContext, ownerId, pipelineId))
                                    {
                                        PipelineExecuteLogDataservice.Create(iotDbContext, ownerId, new DTOs.PipelineExecuteLog()
                                        {
                                            IsHead = isHead,
                                            IsEnd = isEnd,
                                            PipelineId = pipelineId,
                                            ItemId = id,
                                            Raw = rawData,
                                            Message = "Over Subscription"
                                        });
                                        return false;
                                    }

                                    HttpClient http = new HttpClient();
                                    if (!System.String.IsNullOrEmpty(payload.Cookies))
                                    {
                                        http.DefaultRequestHeaders.Add("Cookies", payload.Cookies);
                                    }
                                    if (!System.String.IsNullOrEmpty(payload.Cookies))
                                    {
                                        http.DefaultRequestHeaders.Add("Authorization", payload.Authorization);
                                    }

                                    http.DefaultRequestHeaders.Add("User-Agent", "ItemHub");
                                    string postBody = payload.RequestPayload ?? "";
                                    StringContent stringContent = new StringContent(postBody, System.Text.Encoding.UTF8, payload.ContentType);
                                    HttpResponseMessage response = null;
                                    if (payload.Method == "GET")
                                    {
                                        response = await http.GetAsync(payload.Url);
                                    }
                                    else if (payload.Method == "POST")
                                    {
                                        response = await http.PostAsync(payload.Url, stringContent);
                                    }
                                    else if (payload.Method == "DELETE")
                                    {
                                        response = await http.DeleteAsync(payload.Url);
                                    }
                                    else if (payload.Method == "PATCH")
                                    {
                                        response = await http.PatchAsync(payload.Url, stringContent);
                                    }
                                    else if (payload.Method == "PUT")
                                    {
                                        response = await http.PutAsync(payload.Url, stringContent);
                                    }

                                    if (
                                        (response.StatusCode == System.Net.HttpStatusCode.OK && payload.ContentType != "application/json")
                                        || (response.StatusCode == System.Net.HttpStatusCode.OK && payload.ContentType == "application/json" && System.String.IsNullOrEmpty(payload.ResponseBodyProperty))
                                        )
                                    {
                                        PipelineExecuteLogDataservice.Create(iotDbContext, ownerId, new DTOs.PipelineExecuteLog()
                                        {
                                            IsHead = isHead,
                                            IsEnd = isEnd,
                                            PipelineId = pipelineId,
                                            ItemId = id,
                                            Raw = rawData
                                        });
                                        return true;
                                    }

                                    string result = "";
                                    if (payload.ContentType == "application/json")
                                    {
                                        using (var sr = new System.IO.StreamReader(await response.Content.ReadAsStreamAsync(), System.Text.Encoding.UTF8))
                                        {
                                            result = sr.ReadToEnd();
                                        }
                                    }

                                    if (!System.String.IsNullOrEmpty(payload.ResponseBodyProperty))
                                    {
                                        result = JsonConvert.DeserializeObject<dynamic>(result)[payload.ResponseBodyProperty];

                                        if (payload.Operator == TRIGGER_OPERATOR.E && result == payload.Value)
                                        {
                                            PipelineExecuteLogDataservice.Create(iotDbContext, ownerId, new DTOs.PipelineExecuteLog()
                                            {
                                                IsHead = isHead,
                                                IsEnd = isEnd,
                                                PipelineId = pipelineId,
                                                ItemId = id,
                                                Raw = rawData
                                            });
                                            return true;
                                        }
                                        else
                                        {
                                            decimal numberResult = 0;
                                            bool isDecimal = decimal.TryParse(result, out numberResult);
                                            decimal threshold = 0;
                                            bool isThresholdDecimal = decimal.TryParse(payload.Value, out threshold);
                                            if (!isDecimal || !isThresholdDecimal)
                                            {
                                                return false;
                                            }
                                            if (
                                                (payload.Operator == TRIGGER_OPERATOR.BE && numberResult >= threshold)
                                            || (payload.Operator == TRIGGER_OPERATOR.B && numberResult > threshold)
                                            || (payload.Operator == TRIGGER_OPERATOR.LE && numberResult <= threshold)
                                            || (payload.Operator == TRIGGER_OPERATOR.L && numberResult < threshold)
                                            )
                                            {
                                                PipelineExecuteLogDataservice.Create(iotDbContext, ownerId, new DTOs.PipelineExecuteLog()
                                                {
                                                    IsHead = isHead,
                                                    IsEnd = isEnd,
                                                    PipelineId = pipelineId,
                                                    ItemId = id,
                                                    Raw = rawData
                                                });
                                                return true;
                                            }
                                        }
                                    }
                                    return false;
                                }
                            });
        }
        public static NetworkPipelinePayload ValidateAndGetPayload(string rawData)
        {
            if (System.String.IsNullOrEmpty(rawData))
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_PAYLOAD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            var payload = JsonConvert.DeserializeObject<NetworkPipelinePayload>(rawData);
            if (System.String.IsNullOrEmpty(payload.Url))
            {
                throw new CustomException(ERROR_CODE.NETWORK_PIPELINE_INVALID_URL_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            if (System.String.IsNullOrEmpty(payload.Method))
            {
                throw new CustomException(ERROR_CODE.NETWORK_PIPELINE_INVALID_METHOD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            if (System.String.IsNullOrEmpty(payload.ContentType))
            {
                throw new CustomException(ERROR_CODE.NETWORK_PIPELINE_INVALID_CONTENT_TYPE_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.ContentType != "application/json" && payload.ResponseStatus == null)
            {
                throw new CustomException(ERROR_CODE.NETWORK_PIPELINE_INVALID_RESPONSE_STATUS_REQUIRED_IN_OTHER_CONTENT_TYPE, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.ContentType == "application/json" && !System.String.IsNullOrEmpty(payload.ResponseBodyProperty) && payload.Operator == null)
            {
                throw new CustomException(ERROR_CODE.NETWORK_PIPELINE_INVALID_OPERATOR_REQUIRED_IN_EXTRACT_RESPONSE_BODY, System.Net.HttpStatusCode.BadRequest);
            }

            if (payload.ContentType == "application/json" && !System.String.IsNullOrEmpty(payload.ResponseBodyProperty) && System.String.IsNullOrEmpty(payload.Value))
            {
                throw new CustomException(ERROR_CODE.NETWORK_PIPELINE_INVALID_VALUE_REQUIRED_IN_EXTRACT_RESPONSE_BODY, System.Net.HttpStatusCode.BadRequest);
            }

            return payload;
        }
    }


    public class NetworkPipelinePayload
    {
        public string Url { get; set; }

        public string Method { get; set; }
        public string ContentType { get; set; }
        public TRIGGER_OPERATOR? Operator { get; set; }
        public string Value { get; set; }
        public string RequestPayload { get; set; }
        public string Authorization { get; set; }
        public string Cookies { get; set; }
        public string ResponseBodyProperty { get; set; }
        public int? ResponseStatus { get; set; }
    }

}