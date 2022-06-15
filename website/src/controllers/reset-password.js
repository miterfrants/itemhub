import { RESPONSE_STATUS } from '../constants.js';
import { AuthDataService } from '../dataservices/auth.dataservice.js';
import {
    RoutingController
} from '../swim/routing-controller.js';
import { Toaster } from '../util/toaster.js';

export class ResetPasswordController extends RoutingController {
    static get id () {
        return 'ResetPasswordController';
    }

    async render () {
        this.meta = {
            title: '重設密碼 - ItemHub'
        };

        await super.render({
            passwordInvalidMessage: '',
            confirmPasswordInvalidMessage: ''
        });
    }

    handleInputTypeEnter (event) {
        if (event.type === 'keyup' && event.keyCode === 13) {
            this.elHTML.querySelector('.btn-send').click();
        }
    }

    validatePassword () {
        const elPassword = this.elHTML.querySelector('.password');
        const password = elPassword.value;
        const isValid = this._validatePassword(password);

        if (isValid) {
            this.pageVariable.passwordInvalidMessage = '';
            return true;
        } else {
            this.pageVariable.passwordInvalidMessage = '密碼至少要 12 碼英數';
            return false;
        }
    }

    validateConfirmPassword () {
        const elConfirmPassword = this.elHTML.querySelector('.confirm-password');
        const confirmPassword = elConfirmPassword.value;
        const isValid = this._validatePassword(confirmPassword);

        if (isValid) {
            this.pageVariable.confirmPasswordInvalidMessage = '';
            return true;
        } else {
            this.pageVariable.confirmPasswordInvalidMessage = '密碼至少要 12 碼英數';
            return false;
        }
    }

    checkPasswordValid () {
        if (!this.validatePassword() || !this.validateConfirmPassword()) {
            return;
        }

        const elPassword = this.elHTML.querySelector('.password');
        const password = elPassword.value;

        const elConfirmPassword = this.elHTML.querySelector('.confirm-password');
        const confirmPassword = elConfirmPassword.value;

        if (password !== confirmPassword) {
            this.pageVariable.confirmPasswordInvalidMessage = '密碼不一致，請再次確認';
            return;
        }

        const elButton = this.elHTML.querySelector('.btn-reset');
        elButton.removeAttribute('disabled');
    }

    _validatePassword (password) {
        if (password.length < 12) {
            return false;
        } else if (password.search(/\d/) === -1) {
            return false;
        } else if (password.search(/[a-zA-Z]/) === -1) {
            return false;
        } else if (password.search(/[^a-zA-Z0-9\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\_\\+]/) !== -1) {
            return false;
        }
        return true;
    }

    async resetPassword (event) {
        // validation
        const elButton = event.currentTarget;
        const elForm = elButton.closest('.form');
        const data = {
            token: this.args.token,
            ...elForm.collectFormData()
        };

        elButton.setAttribute('disabled', 'disabled');

        const resp = await AuthDataService.ResetPassword(data);
        elButton.removeAttribute('disabled');

        if (resp.status !== RESPONSE_STATUS.OK) {
            Toaster.popup(Toaster.TYPE.ERROR, resp.data.message);
            return;
        }

        history.pushState({}, '', '/auth/reset-password-finish/');
    }
}
