import { OAUTH_PROVIDER, OAUTH_TYPE, RESPONSE_STATUS, THIRD_PARTY_KEY } from '../constants.js';
import { AuthDataService } from '../dataservices/auth.dataservice.js';
import {
    RoutingController
} from '../swim/routing-controller.js';
import { CookieUtil } from '../util/cookie.js';
import { PopupHelper } from '../util/popup.helper.js';
import { Toaster } from '../util/toaster.js';
import { Validate } from '../util/validate.js';

export class SignInController extends RoutingController {
    static get id () {
        return 'SignInController';
    }

    async render () {
        this.meta = {
            title: '登入 - ItemHub'
        };
        const standalone = window.navigator.standalone;
        const userAgent = window.navigator.userAgent.toLowerCase();
        const safari = /safari\//.test(userAgent);
        const ios = /iphone|ipod|ipad/.test(userAgent);
        await super.render({
            isInApp: (ios && !standalone && !safari) || this.args.isInApp === 'true'
        });
    }

    handleInputTypeEnter (event) {
        if (event.type === 'keyup' && event.keyCode === 13) {
            this.elHTML.querySelector('.btn-sign-in').click();
        }
    }

    async signIn (event) {
        // validation
        const elButton = event.currentTarget;
        const elForm = elButton.closest('.form');
        const data = {
            ...elForm.collectFormData()
        };
        this.elHTML.querySelectorAll('[data-field]').forEach(elItem => {
            elItem.classList.remove('invalid');
        });
        this.elHTML.querySelectorAll('.validation').forEach((elItem) => {
            elItem.innerHTML = '';
        });
        const validationMessage = [];

        if (!data.email) {
            validationMessage.push({ key: 'email', message: 'email 為必填欄位' });
        }

        if (!Validate.Email(data.email)) {
            validationMessage.push({ key: 'email', message: 'email 格式錯誤' });
        }

        if (!data.password) {
            validationMessage.push({ key: 'password', message: '密碼為必填欄位' });
        }

        if (!Validate.MinLength(data.password, 12)) {
            validationMessage.push({ key: 'password', message: '密碼最小長度為 12' });
        }

        if (validationMessage.length > 0) {
            for (let i = 0; i < validationMessage.length; i++) {
                const elInput = this.elHTML.querySelector(`[data-field="${validationMessage[i].key}"]`);
                const elFormInputContainer = elInput.closest('label');
                const elValidation = elFormInputContainer.querySelector('.validation');
                if (!elInput.classList.contains('invalid')) {
                    elInput.classList.add('invalid');
                }
                elValidation.innerHTML = `${elValidation.innerHTML} ${validationMessage[i].message}`;
            }
            this.elHTML.querySelector(`[data-field="${validationMessage[0].key}"]`).focus();
            return;
        }

        elButton.setAttribute('disabled', 'disabled');
        const resp = await AuthDataService.SignIn(data);
        elButton.removeAttribute('disabled');
        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            return;
        }
        const payload = window.jwt_decode(resp.data.token);
        const payloadOfRefreshToken = window.jwt_decode(resp.data.refreshToken);
        CookieUtil.setCookie('token', resp.data.token, null, payload.exp);
        CookieUtil.setCookie('refreshToken', resp.data.refreshToken, null, payloadOfRefreshToken.exp);
        if (this.args.redirectUrl && this.args.redirectUrl.indexOf('http') === 0) {
            location.href = this.args.redirectUrl;
        } else {
            history.replaceState({}, '', this.args.redirectUrl ? this.args.redirectUrl : '/me/');
        }
    }

    async signInWithFacebook () {
        const state = {
            type: OAUTH_TYPE.SIGN_IN,
            provider: OAUTH_PROVIDER.FACEBOOK
        };
        PopupHelper.PopupCenter(`https://www.facebook.com/v12.0/dialog/oauth?client_id=${THIRD_PARTY_KEY.FB_CLIENT_ID}&redirect_uri=${window.location.origin}/oauth/&state=${JSON.stringify(state)}`, 'fb auth', 600, 500);
    }

    async signInWithLine () {
        if (!this.pageVariable.isInApp) {
            PopupHelper.PopupCenter(`https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${THIRD_PARTY_KEY.LINE_CLIENT_ID}&redirect_uri=${window.location.origin}/oauth/&state=${OAUTH_PROVIDER.LINE},${OAUTH_TYPE.SIGN_IN}&bot_prompt=aggressive&scope=profile%20openid%20email`, 'line auth', 600, 500);
        } else {
            location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${THIRD_PARTY_KEY.LINE_CLIENT_ID}&redirect_uri=${window.location.origin}/oauth/&state=${OAUTH_PROVIDER.LINE},${OAUTH_TYPE.SIGN_IN}&bot_prompt=aggressive&scope=profile%20openid%20email`;
        }
    }

    async signInWithGoogle () {
        const state = {
            type: OAUTH_TYPE.SIGN_IN,
            provider: OAUTH_PROVIDER.GOOGLE
        };
        const url = ['https://accounts.google.com/o/oauth2/v2/auth?1=1', 'scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile', 'include_granted_scopes=true', 'response_type=code', `state=${JSON.stringify(state)}`, `redirect_uri=${location.origin}/oauth/`, `client_id=${THIRD_PARTY_KEY.GOOGLE_CLIENT_ID}`].join('&');
        if (!this.pageVariable.isInApp) {
            PopupHelper.PopupCenter(url, 'google auth', 600, 500);
        } else {
            location.href = url;
        }
    }
}
