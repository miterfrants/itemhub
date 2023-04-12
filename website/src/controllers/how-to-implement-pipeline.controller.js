import { APP_CONFIG } from '../config.js';
import { EVENTS } from '../constants.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class HowToImplementPipelineController extends RoutingController {
    static get id () {
        return 'HowToImplementPipelineController';
    }

    async render () {
        this.meta = {
            title: '自動化觸發流程 - 如何使用 - ItemHub',
            'og:title': '自動化觸發流程 - 如何使用 - ItemHub',
            description: '更方便的操控物聯網 (IoT) 裝置，並提供了多種觸發模式，可彈性的依據需求設定流程，也能讓不同裝置互相支援，實現裝置操控自動化',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub 自動化觸發流程'
        };

        for (const key in this.parentController.pageVariable) {
            if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') !== -1) {
                this.parentController.pageVariable[key] = '';
            } else if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') === -1) {
                this.parentController.pageVariable[key] = 'd-none';
            }
        }

        this.parentController.pageVariable.expandedHowToImplementPipelineVisible = '';
        this.parentController.pageVariable.expandedHowToImplementPipelineArrowVisible = 'up-arrow';

        await super.render({
        });

        this.parentController.buildIndex('.how-to-implement-pipeline');
        this.args.gtag('event', EVENTS.HOW_TO_IMPLEMENT_PIPELINE);
    }
}
