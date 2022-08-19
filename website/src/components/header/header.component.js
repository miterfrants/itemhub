import { APP_CONFIG } from '../../config.js';
import {
    BaseComponent
} from '../../swim/base.component.js';
import { CookieUtil } from '../../util/cookie.js';

export class HeaderComponent extends BaseComponent {
    constructor (elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'HeaderComponent';
    }

    async render () {
        await super.render({
            ...this.variable,
            hasSignedInvisibility: CookieUtil.getCookie('token') ? 'd-none' : 'd-block',
            hasSignedVisibility: CookieUtil.getCookie('token') ? 'd-block' : 'd-none',
            isExpanded: false,
            dashboardUrl: APP_CONFIG.DASHBOARD_URL
        });
    }

    computed () {
        return [{
            watchKey: 'isExpanded',
            variableName: 'expandedVisible',
            value: () => {
                return this.variable.isExpanded ? '' : 'd-none';
            }
        }];
    }

    switchMenu (event) {
        this.variable.isExpanded = !this.variable.isExpanded;
    }

    collapse () {
        this.variable.isExpanded = false;
    }

    redirectToDashboard () {
        const token = CookieUtil.getCookie('token');
        if (token) {
            history.pushState({}, '', '/auth/two-factor-auth/');
        } else if (!token) {
            history.replaceState({}, '', `/auth/sign-in/?redirectUrl=${encodeURIComponent('/auth/two-factor-auth/')}`);
        }
    }
}
