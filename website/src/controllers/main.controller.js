import { APP_CONFIG } from '../config.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class MainController extends RoutingController {
    async render () {
        this.meta = {
            title: 'ItemHub',
            'og:title': 'ItemHub',
            description: '不管是農用土壤監控，自動澆灌或是工廠流程自動化，串聯你的裝置與感應器就是這麼輕鬆簡單，ItemHub 讓你專注在智慧裝置的運用，從今天開始你的智慧生活',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,物聯網,iot,串聯裝置,連結裝置,low-code,no-code,iot platform,iot,internet of thing,iot data center,自動澆灌,遠端澆灌,溫室控制,農業 IoT 平台'
        };

        await super.render({
            ...this.args.me,
            numOfRegisteredUser: this.args.numOfRegisteredUser,
            user: this.args.me,
            isSignInInvisible: this.args.me && this.args.me.id ? 'd-none' : ''
        });
    }

    computed () {
        return [{
            watchKey: 'numOfRegisteredUser',
            variableName: 'numberOfPromotedUser',
            value: () => {
                return this.pageVariable.numOfRegisteredUser && this.pageVariable.numOfRegisteredUser > 300 ? 0 : 300 - this.pageVariable.numOfRegisteredUser;
            }
        }];
    }
}
