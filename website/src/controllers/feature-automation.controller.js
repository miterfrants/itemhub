import { APP_CONFIG } from '../config.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class FeatureAutomationController extends RoutingController {
    static get id () {
        return 'FeatureAutomationController';
    }

    async render () {
        this.meta = {
            title: '自動化 - 產品特色 - ItemHub',
            'og:title': '自動化 - 產品特色 - ItemHub',
            description: '透過預先設定好的流程，讓不同的裝置做到自動化控制',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,物聯網,iot,串聯裝置,連結裝置,low-code PaaS'
        };
        await super.render({
        });
    }
}
