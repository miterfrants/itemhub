namespace Homo.IotApi
{
    public partial class ERROR_CODE
    {
        public static string OAUTH_REDIRECT_URI_NOT_IN_WHITLIST = "OAUTH_REDIRECT_URI_NOT_IN_WHITLIST";
        public static string OAUTH_TYPE_ONLY_SUPPORT_CODE = "OAUTH_TYPE_ONLY_SUPPORT_CODE";
        public static string OAUTH_CLIENT_ID_NOT_FOUND = "OAUTH_CLIENT_ID_NOT_FOUND";
        public static string OAUTH_CODE_EXPIRED = "OAUTH_CODE_EXPIRED";
        public static string DEVICE_STATE_EXISTS = "DEVICE_STATE_EXISTS";
        public static string TAPPAY_TRANSACTION_ERROR = "TAPPAY_TRANSACTION_ERROR";
        public static string DUPLICATE_SUBSCRIBE = "DUPLICATE_SUBSCRIBE";
        public static string DUPLICATE_OAUTH_CLIENT_ID = "DUPLICATE_OAUTH_CLIENT_ID";
        public static string DEVICE_OAUTH_CLIENT_EXISTS = "DEVICE_OAUTH_CLIENT_EXISTS";
        public static string NO_SUBSCRIPTION = "NO_SUBSCRIPTION";
        public static string OAUTH_CLIENT_SECRET_ERROR = "OAUTH_CLIENT_SECRET_ERROR";
        public static string TOO_MANY_REQUEST = "TOO_MANY_REQUEST";
        public static string DEVICE_NOT_FOUND = "DEVICE_NOT_FOUND";
        public static string DEIVCE_WITHOUT_MCU = "DEIVCE_WITHOUT_MCU";
        public static string OVER_PRICING_PLAN = "OVER_PRICING_PLAN";

        public static string OFFLINE_NOTIFICATION_USAGE_LIMIT = "OFFLINE_NOTIFICATION_USAGE_LIMIT";

        public static string PIPELINE_INVALID_CONNECTOR_EXISTS = "PIPELINE_INVALID_CONNECTOR_EXISTS";
        public static string PIPELINE_INVALID_INFINITY_LOOP = "PIPELINE_INVALID_INFINITY_LOOP";
        public static string PIPELINE_INVALID_HEAD_TYPE = "PIPELINE_INVALID_HEAD_TYPE";
        public static string PIPELINE_INVALID_PAYLOAD_REQUIRED = "PIPELINE_INVALID_PAYLOAD_REQUIRED";
        public static string PIPELINE_INVALID_PAYLOAD_ITEMS_BIGGER_THAN_TWENTY = "PIPELINE_INVALID_PAYLOAD_ITEMS_BIGGER_THAN_TWENTY";
        public static string PIPELINE_INVALID_ITEM_TYPE_IN_MID = "PIPELINE_INVALID_ITEM_TYPE_IN_MID";
        public static string PIPELINE_INVALID_TYPE_SCHEDULE_IN_END = "PIPELINE_INVALID_TYPE_SCHEDULE_IN_END";
        public static string PIPELINE_INVALID_PAYLOAD = "PIPELINE_INVALID_PAYLOAD";

        public static string PIPELINE_COULD_NOT_ALLOW_MULTIPLE_HEAD = "PIPELINE_COULD_NOT_ALLOW_MULTIPLE_HEAD";
        public static string PIPELINE_COULD_NOT_ALLOW_WITHOUT_HEAD = "PIPELINE_COULD_NOT_ALLOW_WITHOUT_HEAD";
        public static string NOT_ALLOW_PIPELINE_TYPE = "NOT_ALLOW_PIPELINE_TYPE";



        public static string SWITCH_PIPELINE_INVALID_PAYLOAD_DEVICE_ID_REQUIRED = "SWITCH_PIPELINE_INVALID_PAYLOAD_DEVICE_ID_REQUIRED";
        public static string SWITCH_PIPELINE_INVALID_PAYLOAD_PIN_REQUIRED = "SWITCH_PIPELINE_INVALID_PAYLOAD_PIN_REQUIRED";
        public static string SWITCH_PIPELINE_INVALID_PAYLOAD_STATUS_REQUIRED = "SWITCH_PIPELINE_INVALID_PAYLOAD_STATUS_REQUIRED";

        public static string DELAY_PIPELINE_INVALID = "DELAY_PIPELINE_INVALID";

        public static string NETWORK_PIPELINE_INVALID_URL_REQUIRED = "NETWORK_PIPELINE_INVALID_URL_REQUIRED";
        public static string NETWORK_PIPELINE_INVALID_METHOD_REQUIRED = "NETWORK_PIPELINE_INVALID_METHOD_REQUIRED";
        public static string NETWORK_PIPELINE_INVALID_CONTENT_TYPE_REQUIRED = "NETWORK_PIPELINE_INVALID_CONTENT_TYPE_REQUIRED";
        public static string NETWORK_PIPELINE_INVALID_RESPONSE_STATUS_REQUIRED_IN_OTHER_CONTENT_TYPE = "NETWORK_PIPELINE_INVALID_RESPONSE_STATUS_REQUIRED_IN_OTHER_CONTENT_TYPE";
        public static string NETWORK_PIPELINE_INVALID_OPERATOR_REQUIRED_IN_EXTRACT_RESPONSE_BODY = "NETWORK_PIPELINE_INVALID_OPERATOR_REQUIRED_IN_EXTRACT_RESPONSE_BODY";
        public static string NETWORK_PIPELINE_INVALID_VALUE_REQUIRED_IN_EXTRACT_RESPONSE_BODY = "NETWORK_PIPELINE_INVALID_VALUE_REQUIRED_IN_EXTRACT_RESPONSE_BODY";

        public static string NOTIFICATION_PIPELINE_INVALID_NOTIFICATION_TYPE_IS_REQUIRED = "NOTIFICATION_PIPELINE_INVALID_NOTIFICATION_TYPE_IS_REQUIRED";
        public static string NOTIFICATION_PIPELINE_INVALID_EMAIL_REQUIRED = "NOTIFICATION_PIPELINE_INVALID_EMAIL_REQUIRED";
        public static string NOTIFICATION_PIPELINE_INVALID_PHONE_REQUIRED = "NOTIFICATION_PIPELINE_INVALID_PHONE_REQUIRED";
        public static string NOTIFICATION_PIPELINE_INVALID_MESSAGE_REQUIRED = "NOTIFICATION_PIPELINE_INVALID_MESSAGE_REQUIRED";
        public static string NOTIFICATION_PIPELINE_INVALID_MESSAGE_TOO_LONG_50 = "NOTIFICATION_PIPELINE_INVALID_MESSAGE_TOO_LONG_50";


        public static string SENSOR_PIPELINE_INVALID_DEVICE_ID_REQUIRED = "SENSOR_PIPELINE_INVALID_DEVICE_ID_REQUIRED";
        public static string SENSOR_PIPELINE_INVALID_PIN_REQUIRED = "SENSOR_PIPELINE_INVALID_PIN_REQUIRED";
        public static string SENSOR_PIPELINE_INVALID_LAST_ROWS_REQUIRED = "SENSOR_PIPELINE_INVALID_LAST_ROWS_REQUIRED";
        public static string SENSOR_PIPELINE_INVALID_STATIC_METHOD_REQUIRED = "SENSOR_PIPELINE_INVALID_STATIC_METHOD_REQUIRED";
        public static string SENSOR_PIPELINE_INVALID_OPERATOR_REQUIRED = "SENSOR_PIPELINE_INVALID_OPERATOR_REQUIRED";
        public static string SENSOR_PIPELINE_INVALID_THRESHOLD_REQUIRED = "SENSOR_PIPELINE_INVALID_THRESHOLD_REQUIRED";

        public static string SCHEDULE_PIPELINE_INVALID_VALUE_REQUIRED = "SCHEDULE_PIPELINE_INVALID_VALUE_REQUIRED";
        public static string PIPELINE_INVALID_TYPE_OFFLINE_IN_END = "PIPELINE_INVALID_TYPE_OFFLINE_IN_END";
        public static string UNSUPPORT_MEDIA_TYPE = "UNSUPPORT_MEDIA_TYPE";
        public static string INVALID_FILE_EXT = "INVALID_FILE_EXT";
        public static string CAN_UPLOAD_ONLY_ONE_FILE = "CAN_UPLOAD_ONLY_ONE_FILE";
        public static string FILE_NOT_FOUND = "FILE_NOT_FOUND";
        public static string MAX_UPLOAD_SIZE_PER_DAILY = "MAX_UPLOAD_SIZE_PER_DAILY";
    }
}