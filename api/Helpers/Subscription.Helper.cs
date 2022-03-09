using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Homo.IotApi
{
    public static class SubscriptionHelper
    {
        public static decimal GetPrice(PRICING_PLAN pricingPlan)
        {
            if (pricingPlan == PRICING_PLAN.FREE)
            {
                return 0;
            }
            if (pricingPlan == PRICING_PLAN.BASIC)
            {
                return 49;
            }
            else if (pricingPlan == PRICING_PLAN.ADVANCE)
            {
                return 199;
            }
            else if (pricingPlan == PRICING_PLAN.GROWTH)
            {
                return 999;
            }
            else if (pricingPlan == PRICING_PLAN.SMALL_BUSINESS)
            {
                return 4999;
            }
            return 999999;
        }
        public static decimal GetDeviceCount(PRICING_PLAN pricingPlan)
        {
            if (pricingPlan == PRICING_PLAN.FREE)
            {
                return 2;
            }
            if (pricingPlan == PRICING_PLAN.BASIC)
            {
                return 5;
            }
            else if (pricingPlan == PRICING_PLAN.ADVANCE)
            {
                return 20;
            }
            else if (pricingPlan == PRICING_PLAN.GROWTH)
            {
                return 40;
            }
            else if (pricingPlan == PRICING_PLAN.SMALL_BUSINESS)
            {
                return 150;
            }
            return 0;
        }
        public static decimal GetFrequency(PRICING_PLAN pricingPlan)
        {
            if (pricingPlan == PRICING_PLAN.FREE)
            {
                return 30;
            }
            if (pricingPlan == PRICING_PLAN.BASIC)
            {
                return 15;
            }
            else if (pricingPlan == PRICING_PLAN.ADVANCE)
            {
                return 3;
            }
            else if (pricingPlan == PRICING_PLAN.GROWTH)
            {
                return 1;
            }
            else if (pricingPlan == PRICING_PLAN.SMALL_BUSINESS)
            {
                return 1;
            }
            return 0;
        }
        public static string GetStorageTime(PRICING_PLAN pricingPlan)
        {
            if (pricingPlan == PRICING_PLAN.FREE)
            {
                return "30 分鐘";
            }
            if (pricingPlan == PRICING_PLAN.BASIC)
            {
                return "6 小時";
            }
            else if (pricingPlan == PRICING_PLAN.ADVANCE)
            {
                return "1天";
            }
            else if (pricingPlan == PRICING_PLAN.GROWTH)
            {
                return "3天";
            }
            else if (pricingPlan == PRICING_PLAN.SMALL_BUSINESS)
            {
                return "7天";
            }
            return "0 分鐘";
        }
    }
}
