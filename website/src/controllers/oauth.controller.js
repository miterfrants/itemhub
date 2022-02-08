import {
    RoutingController
} from '../swim/routing-controller.js';
import { EVENTS, OAUTH_TYPE, RESPONSE_STATUS } from '../constants.js';
import { AuthDataService } from '../dataservices/auth.dataservice.js';
import { Toaster } from '../util/toaster.js';
import { Swissknife } from '../util/swissknife.js';
import { CookieUtil } from '../util/cookie.js';

export class OauthController extends RoutingController {
    static get id () {
        return 'OauthController';
    }

    async render () {
        await super.render({
            provider: this.args.state.provider
        });
        if (this.args.state.type === OAUTH_TYPE.SIGN_UP) {
            await this.signUp();
        } else if (this.args.state.type === OAUTH_TYPE.SIGN_IN) {
            await this.signIn();
        }
    }

    async signIn () {
        const targetProvider = this.args.socialMediaTypes.find(item => item.label.toString().toLowerCase() === this.args.state.provider);
        const resp = await AuthDataService.SignInWithSocialMedia({
            code: this.args.code,
            provider: targetProvider.value,
            redirectUri: `${location.origin}${location.pathname}`
        });
        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            setTimeout(() => {
                window.close();
            }, 5000);
            return;
        }

        CookieUtil.setCookie('token', resp.data.token);
        opener.history.pushState({}, '', '/?tf=' + new Date().getUTCMilliseconds());
        opener.gtag('event', EVENTS.SIGN_IN);
        window.close();
    }

    async signUp () {
        const targetProvider = this.args.universal.authProvider.find(item => item.label.toString().toLowerCase() === this.args.state.provider);
        const resp = await AuthDataService.AuthWithSocialMedia({
            code: this.args.code,
            provider: targetProvider.value,
            redirectUri: `${location.origin}${location.pathname}`
        });

        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            setTimeout(() => {
                window.close();
            }, 5000);
            return;
        }

        const respOfSignUp = await AuthDataService.SignUp({
            token: resp.data.token,
            password: Swissknife.GenerateRandomText(36)
        });
        if (respOfSignUp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, respOfSignUp.data.message);
            setTimeout(() => {
                window.close();
            }, 5000);
            return;
        }
        opener.gtag('event', EVENTS.SIGN_UP);
        CookieUtil.setCookie('token', respOfSignUp.data.token);
        opener.history.pushState({}, '', '/');
        window.close();
    }
}
