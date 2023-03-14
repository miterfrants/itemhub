using System;

namespace Homo.IotApi
{
    public class RateLimitDataservice
    {
        public static bool IsPipelineExecuteLogOverPricingPlan(IotDbContext dbContext, long ownerId, long pipelineId)
        {
            var subscription = SubscriptionDataservice.GetCurrnetOne(dbContext, ownerId);
            var rateLimit = SubscriptionHelper.GetPipelineExecuteRateLimitPerDay(subscription == null ? null : (PRICING_PLAN)subscription.PricingPlan);
            var startOfToday = DateTime.Now.Date;
            var endOfToday = DateTime.Now.Date.AddDays(1).AddTicks(-1);
            var logs = PipelineExecuteLogDataservice.GetList(dbContext, ownerId, pipelineId, true, startOfToday, endOfToday);
            return logs.Count + 1 > rateLimit;
        }
    }
}