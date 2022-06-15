import { RESPONSE_STATUS } from '../constants.js';
import { AuthDataService } from '../dataservices/auth.dataservice.js';
import {
    RoutingController
} from '../swim/routing-controller.js';
import { Toaster } from '../util/toaster.js';
import { Validate } from '../util/validate.js';

export class ForgetPasswordController extends RoutingController {
    static get id () {
        return 'ForgetPasswordController';
    }

    async render () {
        this.meta = {
            title: '忘記密碼 - ItemHub'
        };

        await super.render({
            isFormVisible: 'd-block',
            isSendMailVisible: 'd-none'
        });
    }

    handleInputTypeEnter (event) {
        if (event.type === 'keyup' && event.keyCode === 13) {
            this.elHTML.querySelector('.btn-send').click();
        }
    }

    async resetPassword (event) {
        // validation
        const elButton = event.currentTarget;
        const elForm = elButton.closest('.form');
        const data = {
            ...elForm.collectFormData()
        };
        this.elHTML.querySelectorAll('[data-field]').forEach(elItem => {
            elItem.classList.remove('invalid');
        });
        this.elHTML.querySelectorAll('.validation').forEach((elItem) => {
            elItem.innerHTML = '';
        });
        const validationMessage = [];

        if (!data.email) {
            validationMessage.push({ key: 'email', message: 'email 為必填欄位' });
        }

        if (!Validate.Email(data.email)) {
            validationMessage.push({ key: 'email', message: 'email 格式錯誤' });
        }

        if (validationMessage.length > 0) {
            for (let i = 0; i < validationMessage.length; i++) {
                const elInput = this.elHTML.querySelector(`[data-field="${validationMessage[i].key}"]`);
                const elFormInputContainer = elInput.closest('label');
                const elValidation = elFormInputContainer.querySelector('.validation');
                if (!elInput.classList.contains('invalid')) {
                    elInput.classList.add('invalid');
                }
                elValidation.innerHTML = `${elValidation.innerHTML} ${validationMessage[i].message}`;
            }
            this.elHTML.querySelector(`[data-field="${validationMessage[0].key}"]`).focus();
            return;
        }

        elButton.setAttribute('disabled', 'disabled');

        const resp = await AuthDataService.SendResetPasswordMail(data);
        elButton.removeAttribute('disabled');

        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            return;
        }

        this.pageVariable.isFormVisible = 'd-none';
        this.pageVariable.isSendMailVisible = '';
    }
}
