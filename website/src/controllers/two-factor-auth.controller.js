import { RESPONSE_STATUS } from '../constants.js';
import { AuthDataService } from '../dataservices/auth.dataservice.js';
import {
    RoutingController
} from '../swim/routing-controller.js';
import { CookieUtil } from '../util/cookie.js';
import { Toaster } from '../util/toaster.js';
import { APP_CONFIG } from '../config.js';

export class TwoFactorAuthController extends RoutingController {
    constructor (elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.countdownDuration = 60;
    }

    static get id () {
        return 'TwoFactorAuthController';
    }

    async render () {
        this.meta = {
            title: '兩步驟驗證 - ItemHub'
        };

        const token = CookieUtil.getCookie('token');
        if (!token) {
            history.pushState({}, '', `/auth/sign-in/?redirectUrl=${encodeURIComponent('/auth/two-factor-auth/')}`);
            return;
        }

        const payload = window.jwt_decode(token);

        await super.render({
            isSentVisible: 'd-none',
            email: payload.extra.Email,
            sendLabel: '傳送驗證碼至信箱',
            countdownDuration: this.countdownDuration
        });
    }

    async sendTwoFactorAuthMail (event) {
        const elButton = event.currentTarget;
        elButton.setAttribute('disabled', 'disabled');
        const token = CookieUtil.getCookie('token');
        this.pageVariable.sendLabel = '送出中....';
        const resp = await AuthDataService.SendTwoFactorAuthMail({
            token
        });
        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            elButton.removeAttribute('disabled');
            this.pageVariable.sendLabel = '傳送驗證碼至信箱';
            return;
        }
        this.pageVariable.countdownDuration = this.countdownDuration;
        this.pageVariable.sendLabel = `可於 ${this.pageVariable.countdownDuration} 秒後重送`;
        this.pageVariable.isSentVisible = '';
        this.countdown();
    }

    countdown () {
        setTimeout(() => {
            this.pageVariable.countdownDuration -= 1;
            this.pageVariable.sendLabel = `可於 ${this.pageVariable.countdownDuration} 秒後重送`;
            if (this.pageVariable.countdownDuration === 0) {
                const elButton = this.elHTML.querySelector('.btn-send');
                elButton.removeAttribute('disabled');
                this.pageVariable.sendLabel = '傳送驗證碼至信箱';
                return;
            }

            this.countdown();
        }, 1000);
    }

    async exchangeDashboardToken (event) {
        const elCode = this.elHTML.querySelector('.code');
        const code = elCode.value;

        if (code === '') {
            Toaster.popup(Toaster.TYPE.ERROR, '請輸入驗證碼');
            return;
        }

        if (code.length !== 6 || isNaN(Number(code))) {
            Toaster.popup(Toaster.TYPE.ERROR, '驗證碼為六碼數字');
            return;
        }

        const elButton = event.currentTarget;
        elButton.setAttribute('disabled', 'disabled');
        const token = CookieUtil.getCookie('token');

        const resp = await AuthDataService.ExchangeDashboardToken({
            token,
            code
        });
        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            elButton.removeAttribute('disabled');
            return;
        }

        if (APP_CONFIG.ENV === 'dev') {
            location.href = `${APP_CONFIG.DASHBOARD_URL}?dashboardToken=${resp.data.token}`;
        } else {
            const dashboardPayload = window.jwt_decode(resp.data.token);
            CookieUtil.setCookie('dashboardToken', resp.data.token, null, dashboardPayload.exp);
            location.href = APP_CONFIG.DASHBOARD_URL;
        }
    }
}
