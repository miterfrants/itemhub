import { APP_CONFIG } from './config.js';
// TODO :「隱私權政策」內容寫完後，可以打開，並加上 RoutingRule 相關設定
// import { AboutController } from './controllers/about.controller.js';
import { AgreementsController } from './controllers/agreements.controller.js';
import { OauthController } from './controllers/oauth.controller.js';
import { CheckoutController } from './controllers/checkout.controller.js';
import { CooperationController } from './controllers/cooperation.controller.js';
import { FeatureController } from './controllers/feature.controller.js';
import { HowController } from './controllers/how.controller.js';
import { MainController } from './controllers/main.controller.js';
import { MasterController } from './controllers/master.controller.js';
import { MeController } from './controllers/me.controller.js';
import { PricingController } from './controllers/pricing.controller.js';
// TODO :「關於我們」內容寫完後，可以打開，並加上 RoutingRule 相關設定
// import { PrivacyPolicyController } from './controllers/privacy-policy.controller.js';
import { RootController } from './controllers/root.controller.js';
import { SignOutController } from './controllers/sign-out.controller.js';
import { UniversalDataService } from './dataservices/universal.dataservice.js';
import { CookieUtil } from './util/cookie.js';
import { AuthRoutingRule } from './routing-rules/auth.routing-rule.js';
import { TransactionController } from './controllers/transaction.controller.js';
import { SubscriptionDataService } from './dataservices/subscription.dataservice.js';
import { RESPONSE_STATUS } from './constants.js';
import { HowToStartController } from './controllers/how-to-start.controller.js';
import { HowToIntegrateGoogleNestController } from './controllers/how-to-integrate-google-smart-home.controller.js';

const gTag = {
    dependency: {
        url: `https://www.googletagmanager.com/gtag/js?id=${APP_CONFIG.GA_PROPERTY_ID}`,
        checkVariable: 'dataLayer',
        defer: true,
        async: true
    },
    prepareData: {
        key: 'gtag',
        func: () => {
            window.dataLayer = window.dataLayer || [];
            if (!window.gtag) {
                function gtag () {
                    window.dataLayer.push(arguments);
                }
                gtag('js', new Date());
                gtag('config', APP_CONFIG.GA_PROPERTY_ID);
                window.gtag = gtag;
            }

            return window.gtag;
        }
    }
};

export const RoutingRule = [{
    path: '',
    controller: RootController,
    dependency: [{
        url: '/third-party/jwt-decode.min.js',
        checkVariable: 'jwt_decode'
    }, gTag.dependency],
    children: [AuthRoutingRule, {
        path: '/oauth/?state&code',
        skipSitemap: true,
        controller: OauthController,
        html: '/template/oauth.html',
        dependency: [{
            url: `https://www.googletagmanager.com/gtag/js?id=${APP_CONFIG.GA_PROPERTY_ID}`,
            checkVariable: 'dataLayer'
        }, gTag.dependency],
        prepareData: [gTag.prepareData, {
            key: 'state',
            func: (args) => {
                if (args._state.startsWith('line')) {
                    const states = args._state.split(',');
                    return {
                        provider: states[0],
                        type: states[1]
                    };
                } else {
                    return JSON.parse(args._state);
                }
            }
        }, {
            key: 'socialMediaTypes',
            func: async () => {
                return (await UniversalDataService.GetSocialMediaTypes()).data;
            }
        }]
    }, {
        path: '/sign-out/',
        skipSitemap: true,
        controller: SignOutController,
        dependency: [gTag.dependency],
        prepareData: [gTag.prepareData]
    }, {
        path: '',
        controller: MasterController,
        html: '/template/master.html',
        prepareData: [{
            key: 'token',
            func: () => {
                return CookieUtil.getCookie('token');
            }
        }, {
            key: 'me',
            func: (args) => {
                if (!args.token) {
                    return {
                        id: null,
                        name: '',
                        email: '',
                        isOverSubscriptionPlan: false
                    };
                }

                const extra = window.jwt_decode(args.token).extra;
                return {
                    id: extra.Id,
                    name: `${extra.LastName || ''}${extra.FirstName || ''}`,
                    email: extra.Email,
                    isOverSubscriptionPlan: extra.IsOverSubscriptionPlan
                };
            }
        }, {
            key: 'numOfRegisteredUser',
            func: () => {
                return 0;
            }
        }],
        children: [{
            path: '/',
            controller: MainController,
            html: '/template/main.html',
            prepareData: [gTag.prepareData],
            children: [{
                path: 'pricing/',
                controller: PricingController,
                html: '/template/pricing.html'
            }, {
                path: 'cooperation/',
                controller: CooperationController,
                html: '/template/cooperation.html'
            }, {
                path: 'how/',
                controller: HowController,
                html: '/template/how.html',
                children: [{
                    path: 'start/',
                    controller: HowToStartController
                }, {
                    path: 'integrate-google-smart-home/',
                    controller: HowToIntegrateGoogleNestController
                }]
            }, {
                path: 'feature/',
                controller: FeatureController,
                html: '/components/feature/feature.html'
            }, {
                path: 'me/',
                skipSitemap: true,
                controller: MeController,
                html: '/template/me.html',
                prepareData: [{
                    key: 'currentSubscription',
                    func: async () => {
                        const resp = (await SubscriptionDataService.GetMyCurrentSubscription({
                            token: CookieUtil.getCookie('token')
                        }));
                        if (resp.status !== RESPONSE_STATUS.OK) {
                            return null;
                        }
                        return resp.data;
                    }
                }, {
                    key: 'pricingPlans',
                    func: async () => {
                        return (await UniversalDataService.GetPricingPlan()).data;
                    }
                }]
            }, {
                path: 'checkout/?pricingPlan',
                skipSitemap: true,
                controller: CheckoutController,
                html: '/template/checkout.html',
                dependency: [{
                    url: 'https://js.tappaysdk.com/tpdirect/v5.8.0',
                    checkVariable: 'TPDirect'
                }],
                prepareData: [{
                    key: 'pricingPlans',
                    func: async () => {
                        return (await UniversalDataService.GetPricingPlan()).data;
                    }
                }, {
                    key: 'invoiceTypes',
                    func: async () => {
                        return (await UniversalDataService.GetInvoiceTypes()).data;
                    }
                }]
            }, {
                path: 'transaction/{id}/?rec_trade_id&status',
                skipSitemap: true,
                controller: TransactionController,
                html: '/template/transaction.html',
                dependency: [{
                    url: '/third-party/moment.js',
                    checkVariable: 'moment'
                }],
                prepareData: [{
                    key: 'transactionStatus',
                    func: async () => {
                        return (await UniversalDataService.GetTransactionStatus()).data;
                    }
                }, {
                    key: 'pricingPlans',
                    func: async () => {
                        return (await UniversalDataService.GetPricingPlan()).data;
                    }
                }]

            }, {
                path: 'agreements/',
                controller: AgreementsController,
                html: '/template/agreements.html'
            }]
        }]
    }]
}];
