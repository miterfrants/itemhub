import { HowToImplementHygrometerController } from '../controllers/how-to-implement-hygrometer.controller.js';
import { HowToIntegrateGoogleNestController } from '../controllers/how-to-integrate-google-nest.controller.js';
import { HowToImplementAutopotController } from '../controllers/how-to-implement-autopot.controller.js';
import { HowToImplementPipelineController } from '../controllers/how-to-implement-pipeline.controller.js';
import { HowToStartController } from '../controllers/how-to-start.controller.js';
import { HowController } from '../controllers/how.controller.js';
import { HowToImplementSmartAcController } from '../controllers/how-to-implement-smart-ac.controller.js';

export const HowRoutingRule = {
    path: 'how/',
    controller: HowController,
    html: '/template/how.html',
    children: [{
        path: 'start/',
        controller: HowToStartController
    }, {
        path: 'integrate-google-nest/',
        controller: HowToIntegrateGoogleNestController
    }, {
        path: 'implement-hygrometer/',
        controller: HowToImplementHygrometerController
    }, {
        path: 'implement-autopot/',
        controller: HowToImplementAutopotController
    }, {
        path: 'implement-pipeline/',
        controller: HowToImplementPipelineController
    }, {
        path: 'implement-smart-ac/',
        controller: HowToImplementSmartAcController
    }]
};
