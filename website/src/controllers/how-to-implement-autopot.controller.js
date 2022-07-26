import { APP_CONFIG } from '../config.js';
import { EVENTS } from '../constants.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class HowToImplementAutopotController extends RoutingController {
    static get id () {
        return 'HowToImplementAutopotController';
    }

    async render () {
        this.meta = {
            title: 'DIY 自動澆灌 - 如何使用 - ItemHub',
            'og:title': 'DIY 自動澆灌 - 如何使用 - ItemHub',
            description: '透過幾個步驟 DIY 自動澆灌',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub DIY 自動澆灌'
        };

        for (const key in this.parentController.pageVariable) {
            if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') !== -1) {
                this.parentController.pageVariable[key] = '';
            } else if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') === -1) {
                this.parentController.pageVariable[key] = 'd-none';
            }
        }

        this.parentController.pageVariable.expandedHowToImplementAutopotVisible = '';
        this.parentController.pageVariable.expandedHowToImplementAutopotArrowVisible = 'up-arrow';

        await super.render({
        });

        this.parentController.buildIndex('.how-to-implement-autopot');
        this.args.gtag('event', EVENTS.HOW_TO_IMPLEMENT_AUTOPOT);
    }
}
