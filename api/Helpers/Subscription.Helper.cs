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
        public static decimal GetFrequency(PRICING_PLAN? pricingPlan)
        {
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
            else
            {
                return 30;
            }
        }
        public static string GetStorageTime(PRICING_PLAN pricingPlan)
        {
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
            return "";
        }

        public static int GetStorageSavingSeconds(PRICING_PLAN? pricingPlan)
        {
            if (pricingPlan == PRICING_PLAN.BASIC)
            {
                return 6 * 60 * 60;
            }
            else if (pricingPlan == PRICING_PLAN.ADVANCE)
            {
                return 24 * 60 * 60;
            }
            else if (pricingPlan == PRICING_PLAN.GROWTH)
            {
                return 3 * 24 * 60 * 60;
            }
            else if (pricingPlan == PRICING_PLAN.SMALL_BUSINESS)
            {
                return 7 * 24 * 60 * 60;
            }
            return 30 * 60;
        }

        public static int GetTriggerNotificastionRateLimit(PRICING_PLAN? pricingPlan)
        {
            if (pricingPlan == PRICING_PLAN.BASIC)
            {
                return 100;
            }
            else if (pricingPlan == PRICING_PLAN.ADVANCE)
            {
                return 1000;
            }
            else if (pricingPlan == PRICING_PLAN.GROWTH)
            {
                return 5000;
            }
            else if (pricingPlan == PRICING_PLAN.SMALL_BUSINESS)
            {
                return 10000;
            }
            return 5;
        }
    }
}
