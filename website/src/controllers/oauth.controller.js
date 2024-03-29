import {
    RoutingController
} from '../swim/routing-controller.js';
import { EVENTS, OAUTH_TYPE, RESPONSE_STATUS } from '../constants.js';
import { AuthDataService } from '../dataservices/auth.dataservice.js';
import { Toaster } from '../util/toaster.js';
import { CookieUtil } from '../util/cookie.js';

export class OauthController extends RoutingController {
    static get id () {
        return 'OauthController';
    }

    async render () {
        await super.render({
            provider: this.args.state.provider
        });
        if (this.args.state.type === OAUTH_TYPE.VERIFY_EMAIL_WITH_SOCIAL_MEDIA) {
            await this.getVerifyToken();
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
        if (resp.status !== RESPONSE_STATUS.OK && opener) {
            opener.SwimAppController[1].Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            window.close();
            return;
        } else if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            history.pushState({}, '', '/auth/sign-in/');
            return;
        }

        const payload = window.jwt_decode(resp.data.token);
        CookieUtil.setCookie('token', resp.data.token, null, payload.exp);

        const payloadOfRefresh = window.jwt_decode(resp.data.refreshToken);
        CookieUtil.setCookie('refreshToken', resp.data.refreshToken, null, payloadOfRefresh.exp);
        if (opener) {
            opener.history.pushState({}, '', '/?tf=' + new Date().getUTCMilliseconds());
            opener.window.gtag('event', EVENTS.SIGN_IN);
            window.close();
        } else {
            history.replaceState({}, '', this.args.redirectUrl ? this.args.redirectUrl : '/me/');
        }
    }

    async getVerifyToken () {
        const targetProvider = this.args.socialMediaTypes.find(item => item.label.toString().toLowerCase() === this.args.state.provider);
        const resp = await AuthDataService.VerifyEmailWithSocialMedia({
            code: this.args.code,
            provider: targetProvider.value,
            redirectUri: `${location.origin}${location.pathname}`
        });

        if (resp.status !== RESPONSE_STATUS.OK) {
            if (opener) {
                opener.SwimAppController[1].Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
                window.close();
            } else {
                Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
                history.pushState({}, '', '/auth/sign-in/');
            }
            return;
        }

        if (opener) {
            opener.history.pushState({}, '', `/auth/sign-up/?verifyToken=${resp.data.token}`);
            window.close();
        } else {
            history.pushState({}, '', `/auth/sign-up/?verifyToken=${resp.data.token}`);
        }
    }
}
