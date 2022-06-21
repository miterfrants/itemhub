using System.ComponentModel;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public enum TRIGGER_OPERATOR
    {
        [Description("大於")]
        B,
        [Description("大於等於")]
        BE,
        [Description("小於")]
        L,
        [Description("小於等於")]
        LE,
        [Description("等於")]
        E
    }

    public enum TRIGGER_TYPE
    {
        [Description("裝置")]
        CHANGE_DEVICE_STATE,
        [Description("通知")]
        NOTIFICATION,
        [Description("裝置抽樣資料")]
        DEVICE_SAMPLING_VALUE,
        [Description("排程")]
        SCHEDULED,
    }

    public enum TRIGGER_NOTIFICATION_PERIOD
    {
        [Description("5 分鐘")]
        FIVE_MINUTES,
        [Description("10 分鐘")]
        TEN_MINUTES,
        [Description("30 分鐘")]
        THIRTY_MINUTES,
        [Description("1 小時")]
        ONE_HOUR,
        [Description("3 小時")]
        THREE_HOURS,
        [Description("6 小時")]
        SIX_HOURS,
        [Description("半天")]
        HALF_DAYS,
        [Description("1 天")]
        ONE_DAY,
        [Description("3 天")]
        THREE_DAYS,
        [Description("7 天")]
        SEVEN_DAYS,
        [Description("1 個月")]
        ONE_MONTH,
    }
}