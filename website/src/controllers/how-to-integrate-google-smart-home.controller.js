import { APP_CONFIG } from '../config.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class HowToIntegrateGoogleSmartHomeController extends RoutingController {
    static get id () {
        return 'HowToIntegrateGoogleSmartHomeController';
    }

    async render () {
        this.meta = {
            title: '串接 Google Nest - 如何使用 - ItemHub',
            'og:title': '串接 Google Nest - 如何使用 - ItemHub',
            description: '透過幾個步驟串接 Google Nest, 使用語音控制硬體裝置',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'Google Nest 串接'
        };
        this.parentController.pageVariable.expandedHowToStartVisible = 'd-none';
        this.parentController.pageVariable.expandedHowToBindGoogleSmartHomeVisible = '';
        this.parentController.pageVariable.expandedHowToStartArrowVisible = '';
        this.parentController.pageVariable.expandedHowToBindGoogleSmartHomeArrowVisible = 'up-arrow';

        await super.render({
        });
    }
}
