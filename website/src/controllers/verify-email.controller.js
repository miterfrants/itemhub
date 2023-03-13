import {
    RoutingController
} from '../swim/routing-controller.js';
import { ERROR_KEYS, OAUTH_PROVIDER, OAUTH_TYPE, RESPONSE_STATUS, THIRD_PARTY_KEY } from '../constants.js';
import { AuthDataService } from '../dataservices/auth.dataservice.js';
import { Toaster } from '../util/toaster.js';
import { PopupHelper } from '../util/popup.helper.js';
import { Validate } from '../util/validate.js';

export class VerifyEmailController extends RoutingController {
    constructor (elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.resendTimer = null;
        this.resendTime = 0;
    }

    static get id () {
        return 'VerifyEmailController';
    }

    async render () {
        this.meta = {
            title: '驗證信箱 - ItemHub'
        };
        await super.render({
            emailInvalidMessage: '',
            codeInvalidMessage: ''
        });
    }

    async exit (args) {
        clearTimeout(this.resendTimer);
        return super.exit(args);
    }

    validateEmail (event) {
        const elBtnSendVerifyEmail = this.elHTML.querySelector('.btn-send-verify-email');
        if (event.type === 'keyup' && event.keyCode === 13) {
            elBtnSendVerifyEmail.click();
            return;
        }

        const elEmail = this.elHTML.querySelector('[data-field="email"]');
        const email = elEmail.value;
        const isValid = Validate.Email(email);
        if (isValid) {
            elBtnSendVerifyEmail.removeAttribute('disabled');
            this.pageVariable.emailInvalidMessage = '';
        } else {
            elBtnSendVerifyEmail.setAttribute('disabled', 'disabled');
            this.pageVariable.emailInvalidMessage = 'Email 格式錯誤';
        }
    }

    async sendVerifyEmail (event) {
        const elButton = event.currentTarget;
        elButton.setAttribute('disabled', 'disabled');
        const elForm = elButton.closest('.form');
        const data = {
            ...elForm.collectFormData()
        };
        elButton.innerHTML = '寄送中...';
        const elEmail = this.elHTML.querySelector('[data-field="email"]');
        elEmail.setAttribute('disabled', 'disabled');
        const resp = await AuthDataService.SendVerifyEmail(data);
        if (resp.status !== RESPONSE_STATUS.OK && resp.data.errorKey === ERROR_KEYS.SIGN_IN_BY_OTHER_WAY) {
            const duplicateProviderMessag = [];
            for (const provider in resp.data.payload.duplicatedUserProvider) {
                duplicateProviderMessag.push(`${provider}: ${resp.data.payload.duplicatedUserProvider[provider]}`);
            }
            Toaster.popup(Toaster.TYPE.ERROR, `你已經註冊過囉~<br/>已使用 ${duplicateProviderMessag.join('<br/>')} 註冊`);

            elButton.innerHTML = '傳送驗證碼至信箱';
            elButton.removeAttribute('disabled');
            elEmail.removeAttribute('disabled');
        } else if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);

            elButton.innerHTML = '傳送驗證碼至信箱';
            elButton.removeAttribute('disabled');
            elEmail.removeAttribute('disabled');
        } else {
            const elCode = this.elHTML.querySelector('[data-field="code"]');
            elCode.removeAttribute('disabled');
            elCode.focus();
            this._countdownResendTimerStart();
        }
    }

    validateCode (event) {
        if (event.type === 'keyup' && event.keyCode === 13) {
            this.elHTML.querySelector('.btn-next').click();
            return;
        }
        const elNextButton = this.elHTML.querySelector('.btn-next');
        const code = event.currentTarget.value;
        if (code.length === 6 && !isNaN(code)) {
            this.pageVariable.codeInvalidMessage = '';
            elNextButton.removeAttribute('disabled');
        } else {
            this.pageVariable.codeInvalidMessage = '驗證碼格式錯誤';
            elNextButton.setAttribute('disabled', 'disabled');
        }
    }

    async getValidatedEmailToken (event) {
        const elForm = event.currentTarget.closest('.form');
        const elNextButton = this.elHTML.querySelector('.btn-next');
        const data = elForm.collectFormData();
        elNextButton.setAttribute('disabled', 'disabled');
        const resp = await AuthDataService.VerifyEmail({
            ...data,
            token: this.args.token
        });
        if (resp.status !== RESPONSE_STATUS.OK) {
            this.pageVariable.codeInvalidMessage = resp.data.message;
            elNextButton.removeAttribute('disabled', 'disabled');
            return;
        }
        history.pushState({}, '', `/auth/sign-up/?verifyPhoneToken=${resp.data.token}`);
    }

    async popupFacebookAndGetCode () {
        const state = {
            type: OAUTH_TYPE.VERIFY_EMAIL_WITH_SOCIAL_MEDIA,
            provider: OAUTH_PROVIDER.FACEBOOK
        };
        PopupHelper.PopupCenter(`https://www.facebook.com/v12.0/dialog/oauth?client_id=${THIRD_PARTY_KEY.FB_CLIENT_ID}&scope=email&redirect_uri=${window.location.origin}/oauth/&state=${JSON.stringify(state)}`, 'fb auth', 600, 500);
    }

    async popupLineAndGetCode () {
        PopupHelper.PopupCenter(`https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${THIRD_PARTY_KEY.LINE_CLIENT_ID}&redirect_uri=${window.location.origin}/oauth/&state=${OAUTH_PROVIDER.LINE},${OAUTH_TYPE.VERIFY_EMAIL_WITH_SOCIAL_MEDIA}&bot_prompt=aggressive&scope=profile%20openid%20email`, 'line auth', 600, 500);
    }

    async popupGoogleAndGetCode () {
        const state = {
            type: OAUTH_TYPE.VERIFY_EMAIL_WITH_SOCIAL_MEDIA,
            provider: OAUTH_PROVIDER.GOOGLE
        };
        const url = ['https://accounts.google.com/o/oauth2/v2/auth?1=1', 'scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile', 'include_granted_scopes=true', 'response_type=code', `state=${JSON.stringify(state)}`, `redirect_uri=${location.origin}/oauth/`, `client_id=${THIRD_PARTY_KEY.GOOGLE_CLIENT_ID}`].join('&');
        PopupHelper.PopupCenter(url, 'google auth', 600, 500);
    }

    _countdownResendTimerStart () {
        clearTimeout(this.resendTimer);
        this.resendTime = new Date();
        this._countdownMain();
    }

    _countdownMain () {
        const elSendVerifyMailButton = this.elHTML.querySelector('.btn-send-verify-email');
        const diff = 60 - Math.round((new Date() - this.resendTime) / 1000);
        if (diff <= 0) {
            elSendVerifyMailButton.innerHTML = '傳送驗證碼至信箱';
            elSendVerifyMailButton.removeAttribute('disabled');
            this.elHTML.querySelector('[data-field="email"]').removeAttribute('disabled', 'disabled');
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
