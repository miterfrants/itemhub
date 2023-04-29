import { APP_CONFIG } from '../config.js';
import {
    RoutingController
} from '../swim/routing-controller.js';

export class HowController extends RoutingController {
    constructor (elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.throttlePause = false;
        this.index = [];
    }

    static get id () {
        return 'HowController';
    }

    async render () {
        this.meta = {
            title: '如何使用 - ItemHub',
            'og:title': '如何使用 - ItemHub',
            description: '簡單快速三步驟，即可完成連接與使用設定，串聯你的裝置或感應器就是這麼輕鬆簡單，ItemHub 讓你專注在智慧裝置的運用，從今天開始你的智慧生活',
            image: `${APP_CONFIG.FRONT_END_URL}/assets/images/share.png`,
            keywords: 'ItemHub,物聯網,iot,串聯裝置,連結裝置,low-code,no-code,iot platform,iot,internet of thing,iot data center'
        };
        await super.render({
            expandedHowToIntegrateGoogleNestVisible: 'd-none',
            expandedHowToIntegrateGoogleNestArrowVisible: '',
            expandedHowToStartVisible: 'd-none',
            expandedHowToStartArrowVisible: '',
            expandedHowToImplementHygrometerVisible: 'd-none',
            expandedHowToImplementHygrometerArrowVisible: '',
            expandedHowToImplementAutopotVisible: 'd-none',
            expandedHowToImplementAutopotArrowVisible: '',
            expandedHowToImplementPipelineVisible: 'd-none',
            expandedHowToImplementPipelineArrowVisible: '',
            expandedHowToImplementSmartAcVisible: 'd-none',
            expandedHowToImplementSmartAcArrowVisible: '',
            howImageVisible: 'd-none d-md-block'
        });
    }

    async postRender () {
        await super.postRender();
        window.addEventListener('hashchange', this.hashChangeHanlder);
        window.addEventListener('scroll', this.scrollingHandler);

        this.hashChangeHanlder();
    }

    async exit (args) {
        window.removeEventListener('hashchange', this.hashChangeHanlder);
        window.removeEventListener('scroll', this.scrollingHandler);
        return super.exit(args);
    }

    hashChangeHanlder (e) {
        setTimeout(() => { // 等當下這個 event loop 結束 取得最新的 location.hash
            if (!location.hash) {
                return;
            }
            const elTarget = document.querySelector(location.hash);
            window.scrollTo(0, elTarget.getBoundingClientRect().top + window.scrollY);
        });
    }

    scrollingHandler (e) {
        const controller = this.AppCurrentController.parentController;
        if (controller.constructor.id === 'HowController') {
            controller.throttle(controller.changeHash, 300);
        }
    }

    throttle (callback, time) {
        if (this.throttlePause) return;

        this.throttlePause = true;

        setTimeout(() => {
            callback();

            this.throttlePause = false;
        }, time);
    };

    changeHash () {
        const controller = window.AppCurrentController.parentController;
        const idMap = [];
        controller.index.forEach((item, i) => {
            const itemClientRect = item.el.getBoundingClientRect();
            idMap.push({ id: item.id, bottom: itemClientRect.bottom });
            item.subtitles.forEach((subitem, j) => {
                const subitemClientRect = subitem.el.parentElement.getBoundingClientRect();
                idMap.push({ id: subitem.id, bottom: subitemClientRect.bottom });
            });
        });
        const inViewPortElements = idMap.filter(item => item.bottom > 0);
        if (inViewPortElements.length === 0) {
            return;
        }
        const id = inViewPortElements[0].id;
        if (inViewPortElements.length > 0) {
            setTimeout(() => {
                history.pushState({}, '', `${location.pathname}#${id}`);
            });
        }

        const targetAnchor = document.querySelector(`a[href="#${id}"]`);
        if (targetAnchor) {
            document.querySelectorAll('.index a').forEach(element => {
                element.classList.remove('active');
            });
            targetAnchor.classList.add('active');
        }
    }

    toggle (e) {
        const rootClass = Object.values(e.currentTarget.classList).find(item => item.indexOf('how-to') === 0);
        if (location.pathname.endsWith(`${rootClass.replace('how-to-', '')}/`)) {
            history.pushState({}, '', '/how/');
            return;
        }
        history.pushState({}, '', `/how/${rootClass.replace('how-to-', '')}/`);
    }

    buildIndex (query) {
        const container = this.elHTML.querySelector(query);
        const index = [];
        container.querySelectorAll('h4').forEach((elTitle, i) => {
            const id = `step${i + 1}`;
            const tempIndex = { id: id, title: elTitle.innerHTML, el: elTitle, subtitles: [] };
            elTitle.parentElement.querySelectorAll('h5').forEach((elSubtitle, j) => {
                const subtitleId = `${id}-${j + 1}`;
                tempIndex.subtitles.push({ id: subtitleId, title: elSubtitle.innerHTML, el: elSubtitle });
            });
            index.push(tempIndex);
        });

        // generate index section & change element id
        const htmlIndex = [];
        index.forEach((item, i) => {
            htmlIndex.push(`<a href="#${item.id}" class="d-block ${i !== 0 ? 'mt-4' : ''}">Step ${i + 1} <span class="ms-2">${item.title}</span></a>`);
            item.el.id = item.id;
            item.el.innerHTML = `Step ${i + 1} <span class="ms-2">${item.title}</span>`;
            item.subtitles.forEach((subitem, j) => {
                htmlIndex.push(`<a href="#${subitem.id}" class="d-block ms-4 my-2">${i + 1}-${j + 1} <span class="ms-2">${subitem.title}</span></a>`);
                subitem.el.id = subitem.id;
                subitem.el.innerHTML = `${i + 1}-${j + 1} <span class="ms-2">${subitem.title}</span>`;
            });
        });
        if (htmlIndex.length === 0) {
            this.elHTML.querySelector('.index').innerHTML = '';
            this.pageVariable.howImageVisible = 'd-none d-lg-block';
        } else {
            this.elHTML.querySelector('.index').innerHTML = htmlIndex.join('\n');
            this.pageVariable.howImageVisible = 'd-none';
        }

        this.index = index;
    }
}
