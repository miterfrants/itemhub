import {
    BaseComponent
} from '../../swim/base.component.js';

export class FeatureComponent extends BaseComponent {
    constructor (elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'FeatureComponent';
    }

    async render () {
        await super.render({
            ...this.variable,
            role: this.variable.withInteraction === 'true' ? 'button' : ''
        });
    }
}
