import { APP_CONFIG } from '../config.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class FeatureSecurityController extends RoutingController {
    static get id () {
        return 'FeatureSecurityController';
    }

    async render () {
        this.meta = {
            title: '安全性 - 產品特色 - ItemHub',
            'og:title': '安全性 - 產品特色 - ItemHub',
            description: '使用 TLS 加密的 HTTP, MQTT 通訊，保障你的資料安全性',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,物聯網,iot,串聯裝置,連結裝置,low-code PaaS'
        };
        await super.render({
        });
    }
}
