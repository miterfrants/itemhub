import { APP_CONFIG } from '../config.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class FeatureEasyConnectivityController extends RoutingController {
    static get id () {
        return 'FeatureEasyConnectivityController';
    }

    async render () {
        this.meta = {
            title: '輕鬆連線 - 產品特色 - ItemHub',
            'og:title': '輕鬆連線 - 產品特色 - ItemHub',
            description: '提供的範例程式碼下載並燒錄，輕鬆使用 Web 介面操控裝置',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,物聯網,iot,串聯裝置,連結裝置,low-code PaaS'
        };
        await super.render({
        });
    }
}
