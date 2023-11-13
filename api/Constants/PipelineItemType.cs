using System.ComponentModel;

namespace Homo.IotApi
{
    public enum PIPELINE_ITEM_TYPE
    {
        [Description("排程")]
        SCHEDULE,
        [Description("感測器")]
        SENSOR,
        [Description("開關")]
        SWITCH,
        [Description("檢查開關狀態")]
        CHECK_SWITCH,
        [Description("延遲")]
        DELAY,
        [Description("網路")]
        NETWORK,
        [Description("通知")]
        NOTIFICATION,
        [Description("裝置離線")]
        OFFLINE,
        [Description("檢查最後上線狀態")]
        CHECK_LAST_ONLINE,
        [Description("紀錄")]
        LOG
    }

    public enum PIPELINE_NOTIFICATION_TYPE
    {
        [Description("簡訊")]
        SMS,
        [Description("Email")]
        EMAIL,
    }

    public enum PIPELINE_DEVICE_OPERATION_TYPE
    {
        [Description("時間")]
        TIME,
        [Description("次數")]
        TIMES,
    }

    public enum PIPELINE_DEVICE_STATISTICAL_METHODS
    {

        [Description("平均數")]
        AVG,
        [Description("最大值")]
        MAX,
        [Description("最小值")]
        MIN,
        [Description("中位數")]
        MID,
        [Description("標準差")]
        STD,
        [Description("總和")]
        SUM
    }
}