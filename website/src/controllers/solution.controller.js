import { APP_CONFIG } from '../config.js';
import { RESPONSE_STATUS } from '../constants.js';
import { ContactDataService } from '../dataservices/contact.dataservice.js';
import {
    RoutingController
} from '../swim/routing-controller.js';
import { Toaster } from '../util/toaster.js';
import { Validate } from '../util/validate.js';

export class SolutionController extends RoutingController {
    static get id () {
        return 'SolutionController';
    }

    async render () {
        this.meta = {
            title: '解決方案 - ItemHub',
            'og:title': '解決方案 - ItemHub',
            description: '透過輕量化的建置，大幅降低物聯網導入成本，減輕企業的負擔，輕鬆實現自動化與高效運作，讓您的企業保持卓越效能',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,智慧控制,輕量化物聯網,智慧監測碳排放,物聯網,iot,串聯裝置,連結裝置,low-code,no-code,iot platform,iot,internet of thing,iot data center'
        };

        await super.render({
            basicCheck: '',
            carbonCheck: ''
        }, this.scrollAndCheckedToType());
    }

    scrollAndCheckedToType () {
        setTimeout(() => {
            const searchParams = new URLSearchParams(location.search);
            const type = searchParams.get('Type');
            let scrollEl;
            if (type === 'basic') {
                scrollEl = document.querySelector('#basic');
                scrollEl.scrollIntoView({ behavior: 'smooth' });
                this.pageVariable.basicCheck = 'checked';
            }
            if (type === 'carbon') {
                scrollEl = document.querySelector('#carbon');
                scrollEl.scrollIntoView({ behavior: 'smooth' });
                this.pageVariable.carbonCheck = 'checked';
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
