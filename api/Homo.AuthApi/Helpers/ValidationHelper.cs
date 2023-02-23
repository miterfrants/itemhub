using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;



namespace Homo.AuthApi
{
    public class ValidationHelpers
    {
        public static bool IsEmail(string email)
        {
            var emailAddressAttribute = new EmailAddressAttribute();
            return emailAddressAttribute.IsValid(email);
        }
        public static bool IsTaiwanMobilePhoneNumber(string phone)
        {
            return Regex.IsMatch(phone, @"09[0-9]{8}");
        }
    }

}
