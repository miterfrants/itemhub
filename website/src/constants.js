import { APP_CONFIG } from './config.js';

export const RESPONSE_STATUS = {
    OK: 'OK',
    FAILED: 'FAILED'
};

export const ERROR_KEYS = {
    SIGN_IN_BY_OTHER_WAY: 'SIGN_IN_BY_OTHER_WAY'
};

export const API = {
    SEND_VERIFY_EMAIL: 'auth/send-verify-email',
    VERIFY_EMAIL: 'auth/verify-email',
    VERIFY_EMAIL_WITH_SOCIAL_MEDIA: 'auth/verify-email-with-social-media',
    SEND_SMS: 'auth/send-sms',
    VERIFY_PHONE: 'auth/verify-phone',
    SIGN_UP: 'auth/sign-up',
    REFRESH_TOKEN: 'auth/refresh-token',
    REFRESH_DASHBOARD_TOKEN: 'auth/refresh-dashboard-token',
    REGISTER_FOR_EARLY_BIRD: 'auth/register-for-early-bird',
    SIGN_IN_WITH_EMAIL: 'auth/sign-in-with-email',
    SIGN_IN_WITH_SOCIAL_MEDIA: 'auth/sign-in-with-social-media',
    SEND_TWO_FACTOR_AUTH_MAIL: 'auth/send-two-factor-auth-mail',
    SEND_RESET_PASSWORD_MAIL: 'auth/send-reset-password-mail',
    RESET_PASSWORD: 'auth/reset-password',
    EXCHANGE_DASHBOARD_TOKEN: 'auth/exchange-dashboard-token',
    UNIVERSAL_SOCIAL_MEDIA_TYPE: 'universal/social-media-types',
    UNIVERSAL_PRICING_PLANS: 'universal/pricing-plans',
    UNIVERSAL_INVOICE_TYPES: 'universal/invoice-types',
    UNIVERSAL_TRANSACTION_STATUS: 'universal/transaction-status',
    NUMBER_OF_REGISTERED_USERS: 'users/number-of-registered-users',
    CHECKOUT: 'checkout',
    CHECK_IN: 'users/check-in',
    TRANSACTION: 'my/transaction/{id}',
    SUBSCRIPTION_BY_TRANSACTION_ID: 'my/subscription/by-transaction-id/{id}',
    SUBSCRIPTION: 'my/subscription',
    CONTACT: 'contact'
};

export const OAUTH_TYPE = {
    VERIFY_EMAIL_WITH_SOCIAL_MEDIA: 'verify-email-with-social-media',
    SIGN_IN: 'sign-in',
    CONNECT: 'connect'
};

export const OAUTH_PROVIDER = {
    FACEBOOK: 'facebook',
    GOOGLE: 'google',
    LINE: 'line'
};

export const THIRD_PARTY_KEY = {
    FB_CLIENT_ID: APP_CONFIG.FB_CLIENT_ID,
    GOOGLE_CLIENT_ID: APP_CONFIG.GOOGLE_CLIENT_ID,
    LINE_CLIENT_ID: APP_CONFIG.LINE_CLIENT_ID
};

export const EVENTS = {
    SIGN_UP: 'SIGN_UP',
    SIGN_OUT: 'SIGN_OUT',
    SIGN_IN: 'SIGN_IN',
    HOW_TO_USE_BASIC: 'HOW_TO_USE_BASIC',
    HOW_TO_INTEGRATE_GOOGLE_NEST: 'HOW_TO_INTEGRATE_GOOGLE_NEST',
    HOW_TO_IMPLEMENT_HYGROMETER: 'HOW_TO_IMPLEMENT_HYGROMETER',
    HOW_TO_IMPLEMENT_AUTOPOT: 'HOW_TO_IMPLEMENT_AUTOPOT',
    HOW_TO_IMPLEMENT_PIPELINE: 'HOW_TO_IMPLEMENT_PIPELINE',
    HOW_TO_IMPLEMENT_SMART_AC: 'HOW_TO_IMPLEMENT_SMART_AC',
    SIGN_UP_FROM_HOW_TO_USE_BASIC: 'SIGN_UP_FROM_HOW_TO_USE_BASIC',
    SIGN_UP_FROM_HOW_TO_INTEGRATE_GOOGLE_NEST: 'SIGN_UP_FROM_HOW_TO_INTEGRATE_GOOGLE_NEST',
    SIGN_UP_FROM_HOW_TO_IMPLEMENT_HYGROMETER: 'SIGN_UP_FROM_HOW_TO_IMPLEMENT_HYGROMETER',
    SIGN_UP_FROM_HOW_TO_IMPLEMENT_AUTOPOT: 'SIGN_UP_FROM_HOW_TO_IMPLEMENT_AUTOPOT',
    SIGN_UP_FROM_HOW_TO_IMPLEMENT_PIPELINE: 'SIGN_UP_FROM_HOW_TO_IMPLEMENT_PIPELINE'
};

export const TRANSACTION_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    ERROR: 'ERROR'
};

export const INVOICE_TYPES = {
    CLOUD_INVOICE: 'CLOUD_INVOICE',
    TRIPLE_INVOICE: 'TRIPLE_INVOICE'
};
