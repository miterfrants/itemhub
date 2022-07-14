import {
    BaseComponent
} from '../../swim/base.component.js';

export class LineUsComponent extends BaseComponent {
    constructor (elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'LineUsComponent';
    }

    async render () {
        await super.render({
            ...this.variable
        });
    }
}
