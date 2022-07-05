import { APP_CONFIG } from '../config.js';
import { EVENTS } from '../constants.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class HowToImplementHygrometerController extends RoutingController {
    static get id () {
        return 'HowToImplementHygrometerController';
    }

    async render () {
        this.meta = {
            title: '實作濕度計 - 如何使用 - ItemHub',
            'og:title': '實作濕度計 - 如何使用 - ItemHub',
            description: '透過幾個步驟實作濕度計, 監控室內濕度',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub 濕度計'
        };

        for (const key in this.parentController.pageVariable) {
            if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') !== -1) {
                this.parentController.pageVariable[key] = '';
            } else if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') === -1) {
                this.parentController.pageVariable[key] = 'd-none';
            }
        }

        this.parentController.pageVariable.expandedHowToImplementHygrometerVisible = '';
        this.parentController.pageVariable.expandedHowToImplementHygrometerArrowVisible = 'up-arrow';

        await super.render({
        });

        this.parentController.buildIndex('.how-to-implement-hygrometer');
        this.args.gtag('event', EVENTS.HOW_TO_IMPLEMENT_HYGROMETER);
    }
}
