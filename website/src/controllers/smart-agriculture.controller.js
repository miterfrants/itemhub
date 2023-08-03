import { APP_CONFIG } from '../config.js';
import { RESPONSE_STATUS } from '../constants.js';
import { ContactDataService } from '../dataservices/contact.dataservice.js';
import {
    RoutingController
} from '../swim/routing-controller.js';
import { Toaster } from '../util/toaster.js';
import { Validate } from '../util/validate.js';

export class SmartAgricultureController extends RoutingController {
    static get id () {
        return 'SmartAgricultureController';
    }

    async render () {
        this.meta = {
            title: '智慧農業 - ItemHub',
            'og:title': '智慧農業 - ItemHub',
            description: '透過輕量化的建置方式，大幅降低導入智慧農業的設備成本，減輕農民的負擔並減少生產中的資源浪費，更提供產銷覆歷自動化服務，提升農業生產管理的效能，實現永續發展。讓我們一起攜手使作物生生不息',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,智慧農業,輕量化智慧農業,產銷覆歷自動化,物聯網,iot,串聯裝置,連結裝置,low-code,no-code,iot platform,iot,internet of thing,iot data center'
        };

        await super.render({
            farmCheck: '',
            farmResumeCheck: '',
            farmHydroponicsCheck: ''
        }, this.scrollAndCheckedToType());
    }

    scrollAndCheckedToType () {
        setTimeout(() => {
            const searchParams = new URLSearchParams(location.search);
            const type = searchParams.get('Type');
            let scrollEl;
            if (type === 'farm') {
                scrollEl = document.querySelector('#farm');
                scrollEl.scrollIntoView({ behavior: 'smooth' });
                this.pageVariable.farmCheck = 'checked';
            }
            if (type === 'farm-resume') {
                scrollEl = document.querySelector('#farm-resume');
                scrollEl.scrollIntoView({ behavior: 'smooth' });
                this.pageVariable.farmResumeCheck = 'checked';
            }
            if (type === 'farm-hydroponics') {
                scrollEl = document.querySelector('#farm-hydroponics');
                scrollEl.scrollIntoView({ behavior: 'smooth' });
                this.pageVariable.farmHydroponicsCheck = 'checked';
            }
        }, 500);
    }

    async sendContactUs (event) {
        const elButton = event.currentTarget;
        elButton.setAttribute('disabled', 'disabled');
        elButton.innerHTML = '資料送出中...';

        this.elHTML.querySelectorAll('.validation').forEach((elItem) => {
            elItem.innerHTML = '';
        });

        const elForm = elButton.closest('.form');
        const content = document.querySelector('[data-field=content').value;
        const data = {
            ...elForm.collectFormData(), content: content
        };

        const validationMessage = [];
        if (!data.type) {
            validationMessage.push({ key: 'type', message: '請選擇類型' });
        }

        if (!data.name) {
            validationMessage.push({ key: 'name', message: '姓名為必填欄位' });
        }

        if (!data.phone) {
            validationMessage.push({ key: 'phone', message: '手機為必填欄位' });
        }

        if (!Validate.Phone(data.phone)) {
            validationMessage.push({ key: 'phone', message: '手機格式錯誤' });
        }

        if (!data.content) {
            validationMessage.push({ key: 'content', message: '期望的運用為必填欄位' });
        }

        if (validationMessage.length > 0) {
            for (let i = 0; i < validationMessage.length; i++) {
                const elInput = this.elHTML.querySelector(`[data-field="${validationMessage[i].key}"]`);
                const inputType = elInput.getAttribute('type');
                const elFormInputContainer = elInput.closest('label');
                let elValidation;

                if (inputType === 'checkbox') {
                    elValidation = elFormInputContainer.closest('.checkbox-block').querySelector('.validation');
                }
                if (inputType !== 'checkbox') {
                    elValidation = elFormInputContainer.querySelector('.validation');
                }

                if (!elInput.classList.contains('invalid')) {
                    elInput.classList.add('invalid');
                }
                elValidation.innerHTML = `${elValidation.innerHTML} ${validationMessage[i].message}`;
            }
            this.elHTML.querySelector(`[data-field="${validationMessage[0].key}"]`).focus();
            elButton.removeAttribute('disabled');
            elButton.innerHTML = '送出';
            return;
        }

        const resp = await ContactDataService.ContactUs(data);
        if (resp.status === RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.INFO, '留言成功，我們將儘速與你聯繫。');
        } else {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
        }

        elButton.removeAttribute('disabled');
        elButton.innerHTML = '送出';
    }

    validatePhone (event) {
        const elSendSmsButton = this.elHTML.querySelector('.btn-send-sms');
        if (event.type === 'keyup' && event.keyCode === 13) {
            elSendSmsButton.click();
            return;
        }

        const elPhone = this.elHTML.querySelector('[data-field="phone"]');
        const phone = elPhone.value;
        const phonePattern = /^09[0-9]{8}$/;
        const isValid = phonePattern.test(phone);
        if (isValid) {
            elSendSmsButton.removeAttribute('disabled');
            this.pageVariable.phoneInvalidMessage = '';
        } else {
            elSendSmsButton.setAttribute('disabled', 'disabled');
            this.pageVariable.phoneInvalidMessage = '手機格式錯誤';
        }
    }
}
