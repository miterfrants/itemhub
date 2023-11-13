using System;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Homo.Core.Constants;
using Microsoft.EntityFrameworkCore;
namespace Homo.IotApi
{
    public class LogPipeline : IPipeline
    {
        public TransformBlock<bool, bool> block { get; set; }
        public LogPipeline(long id, long pipelineId, long ownerId, string DBConnectionString, bool isHead, bool isEnd, bool isVIP, string rawData)
        {
            ValidateAndGetPayload(rawData);
            block = new TransformBlock<bool, bool>(async previous =>
                            {
                                System.Console.WriteLine($"log:{Newtonsoft.Json.JsonConvert.SerializeObject(rawData, Newtonsoft.Json.Formatting.Indented)}");
                                if (!previous)
                                {
                                    return false;
                                }

                                string message = ValidateAndGetPayload(rawData);

                                DbContextOptionsBuilder<IotDbContext> dbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
                                var mysqlVersion = new MySqlServerVersion(new Version(8, 0, 25));
                                dbContextBuilder.UseMySql(DBConnectionString, mysqlVersion);
                                using (var iotDbContext = new IotDbContext(dbContextBuilder.Options))
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

                                    LogDataservice.Create(iotDbContext, new DTOs.Log() { PipelineId = pipelineId, Message = rawData, UserId = ownerId }, LOG_TYPE.PIPELINE);
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

                            });
        }

        public static string ValidateAndGetPayload(string rawData)
        {
            if (System.String.IsNullOrEmpty(rawData))
            {
                throw new CustomException(ERROR_CODE.PIPELINE_INVALID_PAYLOAD_REQUIRED, System.Net.HttpStatusCode.BadRequest);
            }
            return rawData;
        }
    }

}