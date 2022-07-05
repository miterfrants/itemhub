import { EVENTS } from '../../constants.js';
import {
    BaseComponent
} from '../../swim/base.component.js';

export class HowToIntegrateGoogleNestComponent extends BaseComponent {
    constructor (elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'HowToIntegrateGoogleNestComponent';
    }

    async render () {
        await super.render({
            ...this.variable
        });
    }

    toggle () {
        const event = new CustomEvent('toggled', {
            detail: {
                newState: !this.variable.currentState
            }
        });
        this.elHTML.dispatchEvent(event);
    }

    sendGaEvent () {
        this.args.gtag('event', EVENTS.SIGN_UP_FROM_HOW_TO_INTEGRATE_GOOGLE_NEST);
    }
}
