import { EVENTS } from '../../constants.js';
import {
    BaseComponent
} from '../../swim/base.component.js';

export class HowToImplementAutopotComponent extends BaseComponent {
    constructor (elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'HowToImplementAutopotComponent';
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
        this.args.gtag('event', EVENTS.SIGN_UP_FROM_HOW_TO_IMPLEMENT_AUTOPOT);
    }
}
