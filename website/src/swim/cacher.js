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
    HowToImplementAutopotComponent
} from '../components/how-to-implement-autopot/how-to-implement-autopot.component.js';
import HowToImplementAutopotHTML from '../components/how-to-implement-autopot/how-to-implement-autopot.html';
import '../components/how-to-implement-autopot/how-to-implement-autopot.scss';
import {
    HowToImplementHygrometerComponent
} from '../components/how-to-implement-hygrometer/how-to-implement-hygrometer.component.js';
import HowToImplementHygrometerHTML from '../components/how-to-implement-hygrometer/how-to-implement-hygrometer.html';
import '../components/how-to-implement-hygrometer/how-to-implement-hygrometer.scss';
import {
    HowToIntegrateGoogleNestComponent
} from '../components/how-to-integrate-google-nest/how-to-integrate-google-nest.component.js';
import HowToIntegrateGoogleNestHTML from '../components/how-to-integrate-google-nest/how-to-integrate-google-nest.html';
import '../components/how-to-integrate-google-nest/how-to-integrate-google-nest.scss';
import {
    HowToStartComponent
} from '../components/how-to-start/how-to-start.component.js';
import HowToStartHTML from '../components/how-to-start/how-to-start.html';
import '../components/how-to-start/how-to-start.scss';
import {
    HowToUseComponent
} from '../components/how-to-use/how-to-use.component.js';
import HowToUseHTML from '../components/how-to-use/how-to-use.html';
import '../components/how-to-use/how-to-use.scss';
import {
    LineUsComponent
} from '../components/line-us/line-us.component.js';
import LineUsHTML from '../components/line-us/line-us.html';
import '../components/line-us/line-us.scss';
import {
    PricingPlanComponent
} from '../components/pricing-plan/pricing-plan.component.js';
import PricingPlanHTML from '../components/pricing-plan/pricing-plan.html';
import '../components/pricing-plan/pricing-plan.scss';
import agreementsHTML from '../template/agreements.html';import authHTML from '../template/auth.html';import checkoutHTML from '../template/checkout.html';import contactUsHTML from '../template/contact-us.html';import cooperationHTML from '../template/cooperation.html';import forgetPasswordHTML from '../template/forget-password.html';import howHTML from '../template/how.html';import mainHTML from '../template/main.html';import masterHTML from '../template/master.html';import meHTML from '../template/me.html';import oauthHTML from '../template/oauth.html';import pricingHTML from '../template/pricing.html';import privacyPolicyHTML from '../template/privacy-policy.html';import resetPasswordFinishHTML from '../template/reset-password-finish.html';import resetPasswordHTML from '../template/reset-password.html';import signInHTML from '../template/sign-in.html';import signUpFinishHTML from '../template/sign-up-finish.html';import signUpHTML from '../template/sign-up.html';import transactionHTML from '../template/transaction.html';import twoFactorAuthHTML from '../template/two-factor-auth.html';import verifyEmailHTML from '../template/verify-email.html';import '../css/auth.css';import '../css/checkout.css';import '../css/common.css';import '../css/cooperation.css';import '../css/how.css';import '../css/main.css';import '../css/master.css';import '../css/overwrite.css';import '../css/pricing.css';import '../css/sign-in.css';import '../css/transaction.css';import '../css/zindex.css';import '../css/auth.scss';import '../css/checkout.scss';import '../css/common.scss';import '../css/cooperation.scss';import '../css/how.scss';import '../css/main.scss';import '../css/master.scss';import '../css/overwrite.scss';import '../css/pricing.scss';import '../css/sign-in.scss';import '../css/transaction.scss';import '../css/zindex.scss';import { APP_CONFIG } from '../config.js';
export const Cacher = {
    buildCache: () => {
        window.APP_CONFIG = APP_CONFIG;
        window.SwimAppComponents = window.SwimAppComponents || [];
        window.SwimAppLoaderCache = window.SwimAppLoaderCache || [];
        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/check-in/check-in.css`);        window.SwimAppComponents.CheckInComponent = CheckInComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/check-in/check-in.html`] = CheckInHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/cooperation/cooperation.css`);        window.SwimAppComponents.CooperationComponent = CooperationComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/cooperation/cooperation.html`] = CooperationHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/feature/feature.css`);        window.SwimAppComponents.FeatureComponent = FeatureComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/feature/feature.html`] = FeatureHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/footer/footer.css`);        window.SwimAppComponents.FooterComponent = FooterComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/footer/footer.html`] = FooterHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/header/header.css`);        window.SwimAppComponents.HeaderComponent = HeaderComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/header/header.html`] = HeaderHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-implement-autopot/how-to-implement-autopot.css`);        window.SwimAppComponents.HowToImplementAutopotComponent = HowToImplementAutopotComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-implement-autopot/how-to-implement-autopot.html`] = HowToImplementAutopotHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-implement-hygrometer/how-to-implement-hygrometer.css`);        window.SwimAppComponents.HowToImplementHygrometerComponent = HowToImplementHygrometerComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-implement-hygrometer/how-to-implement-hygrometer.html`] = HowToImplementHygrometerHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-integrate-google-nest/how-to-integrate-google-nest.css`);        window.SwimAppComponents.HowToIntegrateGoogleNestComponent = HowToIntegrateGoogleNestComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-integrate-google-nest/how-to-integrate-google-nest.html`] = HowToIntegrateGoogleNestHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-start/how-to-start.css`);        window.SwimAppComponents.HowToStartComponent = HowToStartComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-start/how-to-start.html`] = HowToStartHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-use/how-to-use.css`);        window.SwimAppComponents.HowToUseComponent = HowToUseComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/how-to-use/how-to-use.html`] = HowToUseHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/line-us/line-us.css`);        window.SwimAppComponents.LineUsComponent = LineUsComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/line-us/line-us.html`] = LineUsHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/components/pricing-plan/pricing-plan.css`);        window.SwimAppComponents.PricingPlanComponent = PricingPlanComponent;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/components/pricing-plan/pricing-plan.html`] = PricingPlanHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/agreements.html`] = agreementsHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/auth.html`] = authHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/checkout.html`] = checkoutHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/contact-us.html`] = contactUsHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/cooperation.html`] = cooperationHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/forget-password.html`] = forgetPasswordHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/how.html`] = howHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/main.html`] = mainHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/master.html`] = masterHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/me.html`] = meHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/oauth.html`] = oauthHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/pricing.html`] = pricingHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/privacy-policy.html`] = privacyPolicyHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/reset-password-finish.html`] = resetPasswordFinishHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/reset-password.html`] = resetPasswordHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/sign-in.html`] = signInHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/sign-up-finish.html`] = signUpFinishHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/sign-up.html`] = signUpHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/transaction.html`] = transactionHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/two-factor-auth.html`] = twoFactorAuthHTML;        window.SwimAppLoaderCache[`${APP_CONFIG.FRONT_END_PREFIX}/template/verify-email.html`] = verifyEmailHTML;        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/auth.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/checkout.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/common.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/cooperation.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/how.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/main.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/master.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/overwrite.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/pricing.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/sign-in.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/transaction.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/zindex.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/auth.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/checkout.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/common.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/cooperation.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/how.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/main.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/master.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/overwrite.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/pricing.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/sign-in.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/transaction.css`);        window.SwimAppStylesheet.push(`${APP_CONFIG.FRONT_END_PREFIX}/css/zindex.css`);
    }
}