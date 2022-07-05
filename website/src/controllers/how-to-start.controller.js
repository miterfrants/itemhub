import { APP_CONFIG } from '../config.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class HowToStartController extends RoutingController {
    static get id () {
        return 'HowToStartController';
    }

    async render () {
        this.meta = {
            title: '開始使用 ItemHub - 如何使用 - ItemHub',
            'og:title': '開始使用 ItemHub - 如何使用 - ItemHub',
            description: '新增裝置設定 PIN, 燒錄我們提供的原始碼, 設定自動觸發, 三個步驟達到你的物聯網',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: '使用教學'
        };
        this.parentController.pageVariable.expandedHowToStartVisible = '';
        this.parentController.pageVariable.expandedHowToIntegrateGoogleNestVisible = 'd-none';
        this.parentController.pageVariable.expandedHowToStartArrowVisible = 'up-arrow';
        this.parentController.pageVariable.expandedHowToIntegrateGoogleNestArrowVisible = '';

        await super.render({
        });

        this.parentController.buildIndex('.how-to-start');
    }
}
