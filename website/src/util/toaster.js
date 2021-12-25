import {
    extendStringProtoType,
    extendHTMLElementProtoType
} from './extended-prototype.js';

extendStringProtoType();
extendHTMLElementProtoType();

export const Toaster = {
    TEMPLATE: '<div class="toaster"></div>',
    TEMPLATE_ITEM: '<div class="toaster-item"></div>',
    TEMPLATE_LINK_ITEM: '<a href="{link}" target="_blank" class="toaster-item"></a>',
    TYPE: {
        INFO: 'info',
        ERROR: 'error',
        WARN: 'warn'
    },
    popup: (className, message, duration, link) => {
        let elToaster = document.querySelector('.toaster');
        if (!elToaster) {
            elToaster = Toaster.TEMPLATE.toDom();
            document.body.appendChild(elToaster);
        }

        const toasterItem = new ToasterMessage(elToaster, className, message, duration || 5000, link);
        toasterItem.show();
    }
};

class ToasterMessage {
    constructor (container, className, message, duration, link) {
        this.timer;
        this.el = link ? Toaster.TEMPLATE_LINK_ITEM.replace(/{link}/gi, link).toDom() : Toaster.TEMPLATE_ITEM.toDom();
        this.el.innerHTML = message;
        this.el.addClass(className);
        this.duration = duration;
        this.container = container;
        container.prepend(this.el);
        this.el.addEventListener('mouseover', () => {
            clearTimeout(this.timer);
        });
        this.el.addEventListener('mouseout', () => {
            this.countdown();
        });
    }

    show () {
        this.el.addClass('show');
        this.countdown();
    }

    countdown () {
        this.timer = setTimeout(() => {
            this.el.removeClass('show');
            setTimeout(() => {
                this.container.removeChild(this.el);
            }, 300);
        }, this.duration);
    }
}
