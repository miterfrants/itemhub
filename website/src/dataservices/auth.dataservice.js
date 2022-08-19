import {
    ApiHelper
} from '../util/api.js';

import {
    API
} from '../constants.js';

import {
    APP_CONFIG
} from '../config.js';

export const AuthDataService = {
    SendVerifyEmail: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.SEND_VERIFY_EMAIL;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    SendSms: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.SEND_SMS;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    VerifyEmail: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.VERIFY_EMAIL;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    VerifyPhone: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.VERIFY_PHONE;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    RefreshToken: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.REFRESH_TOKEN;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + data.refreshToken
            }
        });
    },
    RefreshDashboardToken: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.REFRESH_DASHBOARD_TOKEN;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + data.refreshToken
            }
        });
    },
    SignUp: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.SIGN_UP;
        const token = data.token;
        delete data.token;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                Authorization: 'Bearer ' + token
            }
        });
    },
    RegisterForEarlyBird: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.REGISTER_FOR_EARLY_BIRD;
        const token = data.token;
        delete data.token;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                Authorization: 'Bearer ' + token
            }
        });
    },
    SignIn: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.SIGN_IN_WITH_EMAIL;
        delete data.token;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    VerifyEmailWithSocialMedia: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.VERIFY_EMAIL_WITH_SOCIAL_MEDIA;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    SignInWithSocialMedia: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.SIGN_IN_WITH_SOCIAL_MEDIA;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    CheckIn: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.CHECK_IN;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    SendTwoFactorAuthMail: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.SEND_TWO_FACTOR_AUTH_MAIL;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + data.token
            }
        });
    },
    SendResetPasswordMail: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.SEND_RESET_PASSWORD_MAIL;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    ResetPassword: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.RESET_PASSWORD;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                Authorization: 'Bearer ' + data.token
            }
        });
    },
    ExchangeDashboardToken: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.EXCHANGE_DASHBOARD_TOKEN;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + data.token
            },
            body: JSON.stringify({
                code: data.code
            })
        });
    }
};
