using System.ComponentModel;
namespace Homo.AuthApi
{
    public enum INVITATION_STATUS
    {
        [Description("Pending")]
        PENDING,
        [Description("Invited")]
        INVITED,
    }
}