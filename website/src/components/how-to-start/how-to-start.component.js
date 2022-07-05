import {
    BaseComponent
} from '../../swim/base.component.js';

export class HowToStartComponent extends BaseComponent {
    constructor (elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'HowToStartComponent';
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
}
