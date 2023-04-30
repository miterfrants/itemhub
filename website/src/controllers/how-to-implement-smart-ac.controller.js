import { APP_CONFIG } from '../config.js';
import { EVENTS } from '../constants.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class HowToImplementSmartAcController extends RoutingController {
    static get id () {
        return 'HowToImplementSmartAcController';
    }

    async render () {
        this.meta = {
            title: '把傳統冷氣變聰明 - 如何使用 - ItemHub',
            'og:title': '把傳統冷氣變聰明 - 如何使用 - ItemHub',
            description: '用網頁控制傳統冷氣',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,傳統冷氣變聰明,網頁開館冷氣,網路開關冷氣,提前打開冷氣'
        };

        for (const key in this.parentController.pageVariable) {
            if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') !== -1) {
                this.parentController.pageVariable[key] = '';
            } else if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') === -1) {
                this.parentController.pageVariable[key] = 'd-none';
            }
        }

        this.parentController.pageVariable.expandedHowToImplementSmartAcVisible = '';
        this.parentController.pageVariable.expandedHowToImplementSmartAcArrowVisible = 'up-arrow';

        await super.render({
        });

        this.parentController.buildIndex('.how-to-implement-smart-ac');
        this.args.gtag('event', EVENTS.HOW_TO_IMPLEMENT_SMART_AC);
    }
}
