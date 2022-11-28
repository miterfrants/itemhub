using System.ComponentModel;
namespace Homo.AuthApi
{
    public enum ROLE
    {
        [Description("Administrator")]
        ADMIN,
        [Description("User Manage")]
        USER,
        [Description("Only Sign In")]
        NO,
        [Description("Group Manage")]
        GROUP,
        [Description("VIP Group")]
        VIP
    }
}