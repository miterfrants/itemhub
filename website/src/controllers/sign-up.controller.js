import { EVENTS, RESPONSE_STATUS } from '../constants.js';
import { AuthDataService } from '../dataservices/auth.dataservice.js';
import {
    RoutingController
} from '../swim/routing-controller.js';
import { CookieUtil } from '../util/cookie.js';
import { Toaster } from '../util/toaster.js';

export class SignUpController extends RoutingController {
    constructor (elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.resendTimer = null;
        this.resendTime = null;
        this.signUpToken = '';
        this.validPhone = false;
    }

    static get id () {
        return 'SignUpController';
    }

    async render () {
        this.meta = {
            title: '註冊 - ItemHub'
        };
        const jwtPayload = window.jwt_decode(this.args.verifyPhoneToken);
        await super.render({
            phoneInvalidMessage: '',
            codeInvalidMessage: '',
            passwordInvalidMessage: '',
            isEarlyBirdTipVisible: jwtPayload.extra.IsEarlyBird === true ? 'd-block' : 'd-none'
        });
    }

    async exit (args) {
        this.signUpToken = null;
        clearTimeout(this.resendTimer);
        return super.exit(args);
    }

    async sendCodeToPhone (event) {
        const elButton = event.currentTarget;
        elButton.setAttribute('disabled', 'disabled');

        const elForm = elButton.closest('.form');
        const data = {
            ...elForm.collectFormData(),
            verifyPhoneToken: this.args.verifyPhoneToken
        };

        elButton.innerHTML = '寄送中...';
        const elPhone = this.elHTML.querySelector('[data-field="phone"]');
        elPhone.setAttribute('disabled', 'disabled');
        const resp = await AuthDataService.SendSms(data);

        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);

            elButton.innerHTML = '發送驗證碼至手機';
            elButton.removeAttribute('disabled');
            elPhone.removeAttribute('disabled');
        } else {
            const elCode = this.elHTML.querySelector('[data-field="code"]');
            elCode.removeAttribute('disabled');
            elCode.focus();
            this._countdownResendTimerStart();
        }
    }

    validatePhone (event) {
        const elSendSmsButton = this.elHTML.querySelector('.btn-send-sms');
        if (event.type === 'keyup' && event.keyCode === 13) {
            elSendSmsButton.click();
            return;
        }

        const elPhone = this.elHTML.querySelector('[data-field="phone"]');
        const phone = elPhone.value;
        const phonePattern = /^09[0-9]{8}$/;
        const isValid = phonePattern.test(phone);
        if (isValid) {
            elSendSmsButton.removeAttribute('disabled');
            this.pageVariable.phoneInvalidMessage = '';
        } else {
            elSendSmsButton.setAttribute('disabled', 'disabled');
            this.pageVariable.phoneInvalidMessage = '手機格式錯誤';
        }
    }

    async validateCodeAndGetValidatedPhoneToken (event) {
        const elCodeInput = event.currentTarget;
        const elForm = elCodeInput.closest('.form');
        const data = elForm.collectFormData();
        const elSendSmsButton = this.elHTML.querySelector('.btn-send-sms');

        if (event.type === 'keyup' && event.keyCode < 96 && event.keyCode > 105) {
            return;
        }
        if (event.type === 'keyup' && event.keyCode < 48 && event.keyCode > 57) {
            return;
        }

        if (data.code.length !== 6 || isNaN(data.code)) {
            return;
        }

        if (elCodeInput.hasAttribute('disabled')) {
            return;
        }

        elCodeInput.setAttribute('disabled', 'disabled');
        const resp = await AuthDataService.VerifyPhone({
            ...data,
            verifyPhoneToken: this.args.verifyPhoneToken
        });

        const elPassword = this.elHTML.querySelector('[data-field="password"]');

        if (resp.status !== RESPONSE_STATUS.OK) {
            elCodeInput.removeAttribute('disabled');
            this.pageVariable.codeInvalidMessage = resp.data.message;
            this.signUpToken = '';
            elPassword.setAttribute('disabled', 'disabled');
        } else {
            elSendSmsButton.setAttribute('disabled', 'disabled');
            this.validPhone = true;
            elSendSmsButton.innerHTML = '驗證成功';
            elCodeInput.setAttribute('disabled', 'disabled');
            this.pageVariable.codeInvalidMessage = '';
            this.signUpToken = resp.data.token;
            elPassword.removeAttribute('disabled');
        }
    }

    validatePassword (event) {
        if (event.type === 'keyup' && event.keyCode === 13) {
            this.elHTML.querySelector('.btn-finish').click();
            return;
        }

        const elPassword = event.currentTarget;
        const password = elPassword.value;
        const isValid = this._validatePassword(password);
        const elFinishButton = this.elHTML.querySelector('.btn-finish');

        if (isValid) {
            elFinishButton.removeAttribute('disabled');
            this.pageVariable.passwordInvalidMessage = '';
        } else {
            elFinishButton.setAttribute('disabled', 'disabled');
            this.pageVariable.passwordInvalidMessage = '密碼至少要 12 碼英數';
        }
    }

    action () {
        const jwtPayload = window.jwt_decode(this.args.verifyPhoneToken);
        const isEarlyBird = jwtPayload.extra.IsEarlyBird;
        if (isEarlyBird) {
            this.registerForEarlyBird();
        } else {
            this.signUp();
        }
    }

    async signUp () {
        const elPassword = this.elHTML.querySelector('[data-field="password"]');
        elPassword.setAttribute('disabled', 'disabeld');
        const resp = await AuthDataService.SignUp({
            token: this.signUpToken,
            password: elPassword.value
        });

        elPassword.removeAttribute('disabled');
        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            this.pageVariable.passwordInvalidMessage = resp.data.message;
            return;
        }
        const payload = window.jwt_decode(resp.data.token);
        CookieUtil.setCookie('token', resp.data.token, null, payload.exp);

        const payloadOfRefreshToken = window.jwt_decode(resp.data.refreshToken);
        CookieUtil.setCookie('refreshToken', resp.data.refreshToken, null, payloadOfRefreshToken.exp);

        const dashboardPayload = window.jwt_decode(resp.data.dashboardToken);
        CookieUtil.setCookie('dashboardToken', resp.data.dashboardToken, null, dashboardPayload.exp);

        const payloadOfDashboardRefreshToken = window.jwt_decode(resp.data.dashboardRefreshToken);
        CookieUtil.setCookie('dashboardRefreshToken', resp.data.dashboardRefreshToken, null, payloadOfDashboardRefreshToken.exp);

        this.args.gtag('event', EVENTS.SIGN_UP);
        history.pushState({}, '', '/auth/finish/');
    }

    async registerForEarlyBird () {
        const elPassword = this.elHTML.querySelector('[data-field="password"]');
        elPassword.setAttribute('disabled', 'disabeld');

        const resp = await AuthDataService.RegisterForEarlyBird({
            token: this.signUpToken,
            password: elPassword.value
        });

        elPassword.removeAttribute('disabled');
        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            this.pageVariable.passwordInvalidMessage = resp.data.message;
            return;
        }
        CookieUtil.setCookie('token', resp.data.token);
        CookieUtil.setCookie('dashboardToken', resp.data.dashboardToken);
        this.args.gtag('event', EVENTS.SIGN_UP);
        history.pushState({}, '', '/auth/finish/');
    }

    _validatePassword (password) {
        if (password.length < 12) {
            return false;
        } else if (password.search(/\d/) === -1) {
            return false;
        } else if (password.search(/[a-zA-Z]/) === -1) {
            return false;
        } else if (password.search(/[^a-zA-Z0-9\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\_\\+]/) !== -1) {
            return false;
        }
        return true;
    }

    _countdownResendTimerStart () {
        clearTimeout(this.resendTimer);
        this.resendTime = new Date();
        this._countdownMain();
    }

    _countdownMain () {
        const elSendVerifyMailButton = this.elHTML.querySelector('.btn-send-sms');
        if (this.validPhone) {
            return;
        }

        const diff = 60 - Math.round((new Date() - this.resendTime) / 1000);
        if (diff <= 0) {
            elSendVerifyMailButton.innerHTML = '發送驗證碼至手機';
            elSendVerifyMailButton.removeAttribute('disabled');
            this.elHTML.querySelector('[data-field="password"]').setAttribute('disabled', 'disabled');
            this.elHTML.querySelector('[data-field="phone"]').removeAttribute('disabled', 'disabled');
            this.resendTimer = null;
            this.resendTime = 0;
            return;
        }
        elSendVerifyMailButton.innerHTML = `可於 ${diff} 秒後重送`;
        this.resendTimer = setTimeout(() => {
            this._countdownMain();
        }, 1000);
    }
}
