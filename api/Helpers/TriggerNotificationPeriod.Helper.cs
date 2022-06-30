using System.Collections.Generic;
using System.Linq;

namespace Homo.IotApi
{
    public static class TriggerNotificationPeriodHelper
    {
        public static int GetMinutes(TRIGGER_NOTIFICATION_PERIOD period)
        {
            if (period == TRIGGER_NOTIFICATION_PERIOD.FIVE_MINUTES)
            {
                return 5;
            }
            else if (period == TRIGGER_NOTIFICATION_PERIOD.TEN_MINUTES)
            {
                return 10;
            }
            else if (period == TRIGGER_NOTIFICATION_PERIOD.THIRTY_MINUTES)
            {
                return 30;
            }
            else if (period == TRIGGER_NOTIFICATION_PERIOD.ONE_HOUR)
            {
                return 60;
            }
            else if (period == TRIGGER_NOTIFICATION_PERIOD.THREE_HOURS)
            {
                return 3 * 60;
            }
            else if (period == TRIGGER_NOTIFICATION_PERIOD.SIX_HOURS)
            {
                return 6 * 60;
            }
            else if (period == TRIGGER_NOTIFICATION_PERIOD.HALF_DAYS)
            {
                return 12 * 60;
            }
            else if (period == TRIGGER_NOTIFICATION_PERIOD.ONE_DAY)
            {
                return 24 * 60;
            }
            else if (period == TRIGGER_NOTIFICATION_PERIOD.THREE_DAYS)
            {
                return 3 * 24 * 60;
            }
            else if (period == TRIGGER_NOTIFICATION_PERIOD.SEVEN_DAYS)
            {
                return 7 * 24 * 60;
            }
            else if (period == TRIGGER_NOTIFICATION_PERIOD.ONE_MONTH)
            {
                return 30 * 24 * 60;
            }
            return 5;
        }

    }
}