import {
    ApiHelper
} from '../util/api.js';

import {
    API
} from '../constants.js';

import {
    APP_CONFIG
} from '../config.js';

export const ContactDataService = {
    ContactUs: async (data) => {
        const api = APP_CONFIG.API_ENDPOINT + API.CONTACT;
        return ApiHelper.sendRequest(api, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};
