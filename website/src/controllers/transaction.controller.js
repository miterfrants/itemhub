import { APP_CONFIG } from '../config.js';
import { RESPONSE_STATUS, TRANSACTION_STATUS } from '../constants.js';
import { TransactionDataService } from '../dataservices/transaction.dataservice.js';
import { Toaster } from '../util/toaster.js';
import {
    RoutingController
} from '../swim/routing-controller.js';
import { SubscriptionDataService } from '../dataservices/subscription.dataservice.js';

export class TransactionController extends RoutingController {
    constructor (elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.retryLimit = 15;
        this.currentRetryCount = 0;
        this.redirectCountdownPeriod = 30;
        this.timer = null;
    }

    static get id () {
        return 'TransactionController';
    }

    async render () {
        this.meta = {
            title: '付款資料 - ItemHub',
            'og:title': '付款資料 - ItemHub',
            description: '簡單三步驟輕鬆的串聯並操控各項裝置，採用安全性高的 HTTPS API，可客製化各種情境操作，並具備多元化的通知方式，ItemHub 讓你專注在智慧裝置的運用，從今天開始你的智慧生活',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,item-hub,物聯網,iot,串聯裝置,連結裝置,low-code,no-code,iot platform,iot,internet of thing,iot data center'
        };

        await super.render({
            transactionOrder: '',
            transactionMessage: '交易進行中',
            subscriptionPeriod: '',
            priceAtThisPeriod: '',
            wholePrice: '',
            redirectCountdownPeriod: this.redirectCountdownPeriod,
            transactionSuccessVisible: 'd-none',
            DASHBOARD_URL: APP_CONFIG.DASHBOARD_URL
        });
        this.startToGetTransactionStatus();
    }

    async postRender () {
        await super.postRender();
    }

    async exit (args) {
        clearTimeout(this.timer);
        return super.exit(args);
    }

    startToGetTransactionStatus () {
        setTimeout(async () => {
            const resp = await TransactionDataService.GetOne({ id: this.args.id, token: this.args.token });
            if (resp.status !== RESPONSE_STATUS.OK) {
                Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
                return;
            }
            this.pageVariable.transactionMessage += '.';

            const errorStatus = this.args.transactionStatus.find(item => item.key === TRANSACTION_STATUS.ERROR);
            const pendingStatus = this.args.transactionStatus.find(item => item.key === TRANSACTION_STATUS.PENDING);
            this.currentRetryCount += 1;
            if (pendingStatus.value === resp.data.status && this.currentRetryCount <= this.retryLimit) {
                this.startToGetTransactionStatus();
                return;
            } else if (pendingStatus.value === resp.data.status && this.currentRetryCount > this.retryLimit) {
                this.pageVariable.transactionMessage = '刷卡服務供應商沒有回應, 請等待 10 秒後重新整理頁面, 如果重新整理頁面後還是沒有回應, 請與我們聯絡 itemhub.tw@gmail.com';
                return;
            } else if (errorStatus.value === resp.data.status && resp.data.message) {
                this.pageVariable.transactionMessage = `發生錯誤: ${resp.data.message}`;
                return;
            } else if (errorStatus.value === resp.data.status) {
                this.pageVariable.transactionMessage = '發生錯誤: 未完成交易';
                return;
            }
            const respOfSubscription = await SubscriptionDataService.GetOneByTransactionId({
                id: resp.data.id,
                token: this.args.token
            });
            if (respOfSubscription.status !== RESPONSE_STATUS.OK) {
                this.pageVariable.transactionMessage = `找不到對應的訂閱資料: 交易 ID ${resp.data.id}`;
                return;
            }

            const pricingPlan = this.args.pricingPlans.find(item => item.value === respOfSubscription.data.pricingPlan);
            const startAt = window.moment(respOfSubscription.data.startAt).format('YYYY-MM-DD HH:mm');
            const endAt = window.moment(respOfSubscription.data.endAt).format('YYYY-MM-DD HH:mm');
            this.pageVariable.transactionOrder = `訂單編號: ${resp.data.id}`;
            this.pageVariable.transactionMessage = `訂閱方案: ${pricingPlan.label} NTD $${pricingPlan.price}`;
            this.pageVariable.subscriptionPeriod = `本期起迄日: ${startAt} ~ ${endAt}`;
            this.pageVariable.priceAtThisPeriod = `本期金額: ${resp.data.amount} (依照今天日期到月底照比例計算)`;
            this.pageVariable.transactionSuccessVisible = '';
            this.pageVariable.transactionPricingPlanName = pricingPlan.label;
            this.pageVariable.transactionPricingPlanPrice = pricingPlan.price;
            this.startTimerToReddirectToDashboard();
        }, 2000);
    }

    startTimerToReddirectToDashboard () {
        this.timer = setTimeout(() => {
            this.pageVariable.redirectCountdownPeriod -= 1;
            if (this.pageVariable.redirectCountdownPeriod === 0) {
                location.href = `${APP_CONFIG.DASHBOARD_URL}`;
                return;
            }
            this.startTimerToReddirectToDashboard();
        }, 1000);
    }
}
