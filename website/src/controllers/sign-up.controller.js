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
    }

    static get id () {
        return 'SignUpController';
    }

    async render () {
        this.meta = {
            title: '註冊 - ItemHub'
        };
        const jwtPayload = window.jwt_decode(this.args.verifyToken);
        await super.render({
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
        const jwtPayload = window.jwt_decode(this.args.verifyToken);
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
            token: this.args.verifyToken,
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
}
