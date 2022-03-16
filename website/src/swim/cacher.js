/* Auto Generate */
// command line `node build-cache.js`
import {
    CheckInComponent
} from '../components/check-in/check-in.component.js';
import CheckInHTML from '../components/check-in/check-in.html';
import '../components/check-in/check-in.scss';

import {
    CooperationComponent
} from '../components/cooperation/cooperation.component.js';
import CooperationHTML from '../components/cooperation/cooperation.html';
import '../components/cooperation/cooperation.scss';

import {
    FeatureComponent
} from '../components/feature/feature.component.js';
import FeatureHTML from '../components/feature/feature.html';
import '../components/feature/feature.scss';

import {
    FooterComponent
} from '../components/footer/footer.component.js';
import FooterHTML from '../components/footer/footer.html';
import '../components/footer/footer.scss';

import {
    HeaderComponent
} from '../components/header/header.component.js';
import HeaderHTML from '../components/header/header.html';
import '../components/header/header.scss';

import {
    HowToUseComponent
} from '../components/how-to-use/how-to-use.component.js';
import HowToUseHTML from '../components/how-to-use/how-to-use.html';
import '../components/how-to-use/how-to-use.scss';

import {
    PricingPlanComponent
} from '../components/pricing-plan/pricing-plan.component.js';
import PricingPlanHTML from '../components/pricing-plan/pricing-plan.html';
import '../components/pricing-plan/pricing-plan.scss';

import authHTML from '../template/auth.html';

import checkoutHTML from '../template/checkout.html';

import contactUsHTML from '../template/contact-us.html';

import cooperationHTML from '../template/cooperation.html';

import howHTML from '../template/how.html';

import mainHTML from '../template/main.html';

import masterHTML from '../template/master.html';

import meHTML from '../template/me.html';

import oauthHTML from '../template/oauth.html';

import pricingHTML from '../template/pricing.html';

import privacyPolicyHTML from '../template/privacy-policy.html';

import signInHTML from '../template/sign-in.html';

import signUpFinishHTML from '../template/sign-up-finish.html';

import signUpHTML from '../template/sign-up.html';

import transactionHTML from '../template/transaction.html';

import twoFactorAuthHTML from '../template/two-factor-auth.html';

import verifyEmailHTML from '../template/verify-email.html';

import '../css/main.css';
import '../css/auth.css';
import '../css/checkout.css';
import '../css/common.css';
import '../css/cooperation.css';
import '../css/master.css';
import '../css/overwrite.css';
import '../css/pricing.css';
import '../css/sign-in.css';
import '../css/zindex.css';
import '../css/auth.scss';
import '../css/checkout.scss';
import '../css/common.scss';
import '../css/cooperation.scss';
import '../css/main.scss';
import '../css/master.scss';
import '../css/overwrite.scss';
import '../css/pricing.scss';
import '../css/sign-in.scss';
import '../css/zindex.scss';
import { APP_CONFIG } from '../config.js';
export const Cacher = {
    buildCache: () => {
        window.APP_CONFIG = APP_CONFIG;
        window.SwimAppComponents = window.SwimAppComponents || [];
        window.SwimAppLoaderCache = window.SwimAppLoaderCache || [];
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/check-in/check-in.css`);
        window.SwimAppComponents.CheckInComponent = CheckInComponent;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/check-in/check-in.html`] = CheckInHTML;
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/cooperation/cooperation.css`);
        window.SwimAppComponents.CooperationComponent = CooperationComponent;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/cooperation/cooperation.html`] = CooperationHTML;
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/feature/feature.css`);
        window.SwimAppComponents.FeatureComponent = FeatureComponent;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/feature/feature.html`] = FeatureHTML;
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/footer/footer.css`);
        window.SwimAppComponents.FooterComponent = FooterComponent;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/footer/footer.html`] = FooterHTML;
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/header/header.css`);
        window.SwimAppComponents.HeaderComponent = HeaderComponent;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/header/header.html`] = HeaderHTML;
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-use/how-to-use.css`);
        window.SwimAppComponents.HowToUseComponent = HowToUseComponent;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-use/how-to-use.html`] = HowToUseHTML;
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/pricing-plan/pricing-plan.css`);
        window.SwimAppComponents.PricingPlanComponent = PricingPlanComponent;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/pricing-plan/pricing-plan.html`] = PricingPlanHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/auth.html`] = authHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/checkout.html`] = checkoutHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/contact-us.html`] = contactUsHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/cooperation.html`] = cooperationHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/how.html`] = howHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/main.html`] = mainHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/master.html`] = masterHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/me.html`] = meHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/oauth.html`] = oauthHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/pricing.html`] = pricingHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/privacy-policy.html`] = privacyPolicyHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/sign-in.html`] = signInHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/sign-up-finish.html`] = signUpFinishHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/sign-up.html`] = signUpHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/transaction.html`] = transactionHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/two-factor-auth.html`] = twoFactorAuthHTML;
        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/verify-email.html`] = verifyEmailHTML;
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/auth.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/checkout.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/common.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/cooperation.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/main.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/master.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/overwrite.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/pricing.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/sign-in.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/zindex.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/auth.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/checkout.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/common.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/cooperation.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/main.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/master.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/overwrite.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/pricing.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/sign-in.css`);
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/zindex.css`);
    }
};
