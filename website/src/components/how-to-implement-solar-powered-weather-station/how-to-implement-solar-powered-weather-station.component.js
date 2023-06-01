import { EVENTS } from '../../constants.js';
import {
    BaseComponent
} from '../../swim/base.component.js';

export class HowToImplementSolarPoweredWeatherStationComponent extends BaseComponent {
    constructor (elRoot, variable, args) {
        super(elRoot, variable, args);
        this.id = 'HowToImplementSolarPoweredWeatherStationComponent';
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
        this.args.gtag('event', EVENTS.HOW_TO_IMPLEMENT_SOLAR_POWERED_WEATHER_STATION);
    }
}
