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
}