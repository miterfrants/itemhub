import { APP_CONFIG } from '../config.js';
import { EVENTS } from '../constants.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class HowController extends RoutingController {
    static get id () {
        return 'HowController';
    }

    async render () {
        this.meta = {
            title: '如何使用 - ItemHub',
            'og:title': '如何使用 - ItemHub',
            description: '簡單快速三步驟，即可完成連接與使用設定，串聯你的裝置或感應器就是這麼輕鬆簡單，ItemHub 讓你專注在智慧裝置的運用，從今天開始你的智慧生活',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,item-hub,物聯網,iot,串聯裝置,連結裝置,low-code,no-code,iot platform,iot,internet of thing,iot data center'
        };
        await super.render({
            expandedHowToBindGoogleSmartHomeVisible: this.args.expandedGoogleSmartHome === 'true' ? '' : 'd-none',
            expandedHowToStartVisible: this.args.expandedStartUp === 'true' ? '' : 'd-none',
            expandedHowToBindGoogleSmartHomeArrowVisible: this.args.expandedGoogleSmartHome === 'true' ? 'up-arrow' : '',
            expandedHowToStartArrowVisible: this.args.expandedStartUp === 'true' ? 'up-arrow' : ''
        });
    }

    toggleHowToBindSmartHome () {
        let arrayOfQuery = location.search.substring(1).split('&');
        arrayOfQuery = arrayOfQuery.filter(item => item !== 'expandedGoogleSmartHome=true' && item !== '');
        if (this.pageVariable.expandedHowToBindGoogleSmartHomeVisible === '') {
            this.pageVariable.expandedHowToBindGoogleSmartHomeVisible = 'd-none';
            this.pageVariable.expandedHowToBindGoogleSmartHomeArrowVisible = '';
        } else {
            this.pageVariable.expandedHowToBindGoogleSmartHomeVisible = '';
            this.pageVariable.expandedHowToBindGoogleSmartHomeArrowVisible = 'up-arrow';
            this.args.gtag('event', EVENTS.HOW_TO_USE_GOOGLE_HOME);
            arrayOfQuery.push('expandedGoogleSmartHome=true');
        }
        history.pushState({}, '', `/how/?${arrayOfQuery.join('&')}`);
    }

    toggleHowToStart () {
        let arrayOfQuery = location.search.substring(1).split('&');
        arrayOfQuery = arrayOfQuery.filter(item => item !== 'expandedStartUp=true' && item !== '');
        if (this.pageVariable.expandedHowToStartVisible === '') {
            this.pageVariable.expandedHowToStartVisible = 'd-none';
            this.pageVariable.expandedHowToStartArrowVisible = '';
        } else {
            this.pageVariable.expandedHowToStartVisible = '';
            this.pageVariable.expandedHowToStartArrowVisible = 'up-arrow';
            this.args.gtag('event', EVENTS.HOW_TO_USE_BASIC);
            arrayOfQuery.push('expandedStartUp=true');
        }
        history.pushState({}, '', `/how/?${arrayOfQuery.join('&')}`);
    }

    sendGoogleHomeGaEvent () {
        console.log('home');
        this.args.gtag('event', EVENTS.SIGN_UP_FROM_HOW_TO_USE_GOOGLE_HOME);
    }

    sendBasicGaEvent () {
        console.log('basic');
        this.args.gtag('event', EVENTS.SIGN_UP_FROM_HOW_TO_USE_BASIC);
    }
}
