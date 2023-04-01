import { APP_CONFIG } from '../config.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class SmartAgricultureController extends RoutingController {
    static get id () {
        return 'SmartAgricultureController';
    }

    async render () {
        this.meta = {
            title: '智慧農業 - ItemHub',
            'og:title': '智慧農業 - ItemHub',
            description: '透過輕量化的建置方式，大幅降低導入智慧農業的設備成本，減輕農民的負擔並減少生產中的資源浪費，實現永續發展。讓我們一起攜手使作物生生不息',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,智慧農業,輕量化智慧農業,物聯網,iot,串聯裝置,連結裝置,low-code,no-code,iot platform,iot,internet of thing,iot data center'
        };
        await super.render({
        });
    }
}
