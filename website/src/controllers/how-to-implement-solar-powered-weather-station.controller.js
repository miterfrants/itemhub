import { APP_CONFIG } from '../config.js';
import { EVENTS } from '../constants.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class HowToImplementSolarPoweredWeatherStationController extends RoutingController {
    static get id () {
        return 'HowToImplementSolarPoweredWeatherStationController';
    }

    async render () {
        this.meta = {
            title: '太陽能氣象站 - 如何使用 - ItemHub',
            'og:title': '太陽能氣象站 - 如何使用 - ItemHub',
            description: '無線太陽能氣象站，監控戶外溫濕度',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,太陽能氣象站,戶外溫室度,低功耗氣象站,無線氣象站,NBIoT 氣象站,DSI2598+'
        };

        for (const key in this.parentController.pageVariable) {
            if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') !== -1) {
                this.parentController.pageVariable[key] = '';
            } else if (key.indexOf('expandedHowTo') === 0 && key.indexOf('ArrowVisible') === -1) {
                this.parentController.pageVariable[key] = 'd-none';
            }
        }

        this.parentController.pageVariable.expandedHowToImplementSolarPoweredWeatherStationVisible = '';
        this.parentController.pageVariable.expandedHowToImplementSolarPoweredWeatherStationArrowVisible = 'up-arrow';

        await super.render({
        });

        this.parentController.buildIndex('.how-to-implement-solar-powered-weather-station');
        this.args.gtag('event', EVENTS.HOW_TO_IMPLEMENT_SMART_AC);
    }
}
