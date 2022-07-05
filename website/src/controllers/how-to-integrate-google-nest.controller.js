import { APP_CONFIG } from '../config.js';
import { EVENTS } from '../constants.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class HowToIntegrateGoogleNestController extends RoutingController {
    static get id () {
        return 'HowToIntegrateGoogleNestController';
    }

    async render () {
        this.meta = {
            title: '串接 Google Nest - 如何使用 - ItemHub',
            'og:title': '串接 Google Nest - 如何使用 - ItemHub',
            description: '透過幾個步驟串接 Google Nest, 使用語音控制硬體裝置',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'Google Nest 串接'
        };
        for (const key in this.parentController.pageVariable) {
            if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') !== -1) {
                this.parentController.pageVariable[key] = '';
            } else if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') === -1) {
                this.parentController.pageVariable[key] = 'd-none';
            }
        }

        this.parentController.pageVariable.expandedHowToIntegrateGoogleNestVisible = '';
        this.parentController.pageVariable.expandedHowToIntegrateGoogleNestArrowVisible = 'up-arrow';

        await super.render({
        });

        this.parentController.buildIndex('.how-to-integerate-google-nest');
        this.args.gtag('event', EVENTS.HOW_TO_INTEGRATE_GOOGLE_NEST);
    }
}
