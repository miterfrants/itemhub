namespace Homo.IotApi
{
    public class AppSettings : Homo.Api.IAppSettings
    {
        public Common Common { get; set; }
        public Secrets Secrets { get; set; }
    }

    public class Secrets : Homo.Api.ISecrets
    {
        public string JwtKey { get; set; }
        public string RefreshJwtKey { get; set; }
        public string AnonymousJwtKey { get; set; }
        public string SignUpJwtKey { get; set; }
        public string ResetPasswordJwtKey { get; set; }
        public string DBConnectionString { get; set; }
        public string SendGridApiKey { get; set; }
        public string FbClientSecret { get; set; }
        public string GoogleClientSecret { get; set; }
        public string LineClientSecret { get; set; }
        public string SmsUsername { get; set; }
        public string SmsPassword { get; set; }
        public string TapPayPartnerKey { get; set; }
        public string TapPayMerchantId { get; set; }
        public string TapPayMerchantIdNot3D { get; set; }

        public string DashboardJwtKey { get; set; }
        public string MqttUsername { get; set; }
        public string MqttPassword { get; set; }
        public string TestingEmail { get; set; }
        public string TestingPhone { get; set; }

    }

    public class Common : Homo.Api.ICommon
    {
        public string LocalizationResourcesPath { get; set; }
        public int JwtExpirationMonth { get; set; }
        public string SystemEmail { get; set; }
        public string AdminEmail { get; set; }
        public string WebsiteUrl { get; set; }
        public string ApiUrl { get; set; }
        public string FbAppId { get; set; }
        public string GoogleClientId { get; set; }
        public string LineClientId { get; set; }
        public bool AuthByCookie { get; set; }
        public string Pkcs1PublicKeyPath { get; set; }
        public string SmsClientUrl { get; set; }
        public string TapPayEndpointByPrime { get; set; }
        public string TapPayEndpointByToken { get; set; }
        public string FirmwareTemplatePath { get; set; }
        public string StaticPath { get; set; }
        public string ServerId { get; set; } // setup startup.cs
    }
}
