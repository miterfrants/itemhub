import {
    Loader
} from './loader.js';

import {
    RoutingRule
} from '../routing-rule.js';

import {
    Render
} from './render.js';
import { Swissknife } from '../util/swissknife.js';

window.SwimAppController = [];
window.SwimAppControllersAndArgsMapping = {};
window.SwimAppCurrentController = null;
window.SwimAppStylesheet = window.SwimAppStylesheet || [];
window.SwimAppPreviousState = [];

export const Router = {
    pauseRouting: false,
    interrupt: null,
    init: (context) => {
        window.addEventListener('popstate', async () => {
            if (Router.pauseRouting) {
                return;
            }
            const newPath = location.pathname + location.search;
            const exitResult = await Router.exit(window.SwimAppPreviousState, newPath, RoutingRule, context);
            if (exitResult) {
                Router.routing(window.SwimAppPreviousState, newPath, RoutingRule, context);
                window.SwimAppPreviousState = newPath; // eslint-disable-line
            } else {
                history.go(1);
            }
        });

        (function (original) {
            history.originalPushState = history.pushState;
            history.pushState = async function (data, title, newPath) {
                if (Router.pauseRouting) {
                    return;
                }

                const removeAnchorNewPath = newPath.split('#')[0];
                const exitResult = await Router.exit(location.pathname + location.search, removeAnchorNewPath, RoutingRule, context);
                if (exitResult && removeAnchorNewPath !== location.pathname + location.search) {
                    window.SwimAppPreviousState = removeAnchorNewPath;

                    Router.routing(location.pathname + location.search, removeAnchorNewPath, RoutingRule, context);
                    if (Router.interrupt) {
                        Router.interrupt();
                    }
                }

                return original.apply(this, arguments);
            };
        })(history.pushState);

        (function (original) {
            history.replaceState = async function (data, title, newPath) {
                if (Router.pauseRouting) {
                    return;
                }
                const exitResult = await Router.exit(location.pathname + location.search, newPath, RoutingRule, context);
                if (exitResult) {
                    window.SwimAppPreviousState = newPath;
                    Router.routing(location.pathname + location.search, newPath, RoutingRule, context);
                    return original.apply(this, arguments);
                }
            };
        })(history.replaceState);

        Router.routing('', location.pathname + location.search, RoutingRule, context);
        window.SwimAppPreviousState = location.pathname + location.search;

        // overwrite link tag original behavior
        document.querySelectorAll('a').forEach((el) => {
            el.addEventListener('click', overWriteLinkBehavior);
        });

        document.addEventListener('DOMNodeInserted', (e) => {
            if (e.target && e.target.classList && e.target.classList.contains('skip-swim-router')) {
                return;
            }
            if (e.target.tagName === 'A') {
                const htmlElement = e.target;
                htmlElement.addEventListener('click', overWriteLinkBehavior);
            } else if (e.target.querySelectorAll && e.target.querySelectorAll('a').length > 0) {
                e.target.querySelectorAll('a').forEach((el) => {
                    el.addEventListener('click', overWriteLinkBehavior);
                });
            }
        });

        function overWriteLinkBehavior (e) {
            const isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
            const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);
            const isWin = /(win32)/i.test(navigator.platform);
            if (e.currentTarget.target === '_blank' ||
                ((isMacLike || isIOS) && e.metaKey === true) ||
                ((isWin) && e.ctrlKey === true) ||
                e.currentTarget.hasAttribute('not-in-app')
            ) {
                return;
            }
            if (e.currentTarget.href.indexOf(location.origin) !== -1) {
                const newPath = e.currentTarget.href.replace(location.origin, '');
                let originPath = location.pathname;
                e.preventDefault();
                e.stopPropagation();

                if (originPath.split('#')[0] === newPath.split('#')[0]) {
                    window.dispatchEvent(new Event('hashchange'));
                }

                if (e.currentTarget && e.currentTarget.href) {
                    if (e.currentTarget.href.indexOf(location.origin) === -1) {
                        return;
                    }
                }
                if (location.search) {
                    originPath += location.search;
                }

                history.pushState({}, '', newPath);
            }
        }
    },
    exit: async (previousPath, path, routers, context) => {
        const currentRoutingPathArray = Router.getRoutingPathArray(path, routers);
        const previousRoutingPathArray = Router.getRoutingPathArray(previousPath, routers);

        // should be exit controller
        let differenceRoutinPathFromPrevious = previousRoutingPathArray.filter((routingPath) => {
            for (let i = 0; i < currentRoutingPathArray.length; i++) {
                if (routingPath.fullPath === currentRoutingPathArray[i].fullPath) {
                    return false;
                }
            }
            return true;
        });
        differenceRoutinPathFromPrevious = differenceRoutinPathFromPrevious.reverse();
        for (let i = 0; i < differenceRoutinPathFromPrevious.length; i++) {
            const controllerInstance = Router.findControllerInstance(differenceRoutinPathFromPrevious[i].matchRoutingRule.controller);
            if (!controllerInstance) {
                continue;
            }
            const result = await controllerInstance.exit();
            if (!result) {
                return false;
            }
            clearContextArgs(context.args, differenceRoutinPathFromPrevious[i].matchRoutingRule.controller.id);
        }
        return true;
    },
    routing: async (previousPath, path, routers, context) => {
        if (!context.args) {
            context.args = {};
        }
        const currentRoutingPathArray = Router.getRoutingPathArray(path, routers);
        const previousRoutingPathArray = Router.getRoutingPathArray(previousPath, routers);

        // should be enter controller
        let currentIndex = 0;
        let previousIndex = 0;
        const differenceRoutinPathFromCurrent = [];

        if (previousRoutingPathArray.length > 0) {
            while (
                currentIndex < currentRoutingPathArray.length &&
                previousIndex < previousRoutingPathArray.length
            ) {
                if (previousRoutingPathArray[previousIndex].fullPath !== currentRoutingPathArray[currentIndex].fullPath) { // 發現不一樣就把所有後面的 path push 到 diff 裡頭
                    break;
                }
                currentIndex = currentIndex + 1;
                previousIndex = previousIndex + 1;
            }
        }

        for (let i = currentIndex; i < currentRoutingPathArray.length; i++) {
            differenceRoutinPathFromCurrent.push(currentRoutingPathArray[i]);
        }

        // edge case: child routing rule to parent routing rule
        if (
            differenceRoutinPathFromCurrent.length === 0 &&
            previousPath !== path
        ) {
            differenceRoutinPathFromCurrent.push(currentRoutingPathArray[currentRoutingPathArray.length - 1]);
        }

        for (let i = 0; i < differenceRoutinPathFromCurrent.length; i++) {
            const routingPath = differenceRoutinPathFromCurrent[i];
            const pathFragment = routingPath.pathFragment;
            const regexp = routingPath.regexp;
            const routingRule = routingPath.matchRoutingRule;

            // get parent controller
            const currentRoutingPathIndex = currentRoutingPathArray.indexOf(routingPath);
            const parentController = currentRoutingPathIndex === 0 ? null : currentRoutingPathArray[currentRoutingPathIndex - 1].matchRoutingRule.controller;
            const parentControllerInstance = Router.findControllerInstance(parentController);
            if (parentControllerInstance && parentControllerInstance.elHTML) {
                parentControllerInstance.elHTML.querySelector('.child-router').innerHTML = '<div class="spinner"><div></div><div></div><div></div><div></div></div>';
                parentControllerInstance.elHTML.querySelector('.child-router').addClass('loading');
                const elChildRouter = parentControllerInstance.elHTML.querySelector('.child-router');
                if (elChildRouter) {
                    elChildRouter.getAttributeNames().forEach((attrName) => {
                        if (attrName.indexOf('on-') === 0) {
                            const funcName = elChildRouter.getAttribute(attrName).replace(/controller\./gi, '');

                            if (parentControllerInstance[funcName]) {
                                parentControllerInstance.elHTML.addEventListener(attrName.replace(/^on-/gi, ''), (e) => {
                                    parentControllerInstance[funcName](e);
                                });
                            }
                        }
                    });
                }
            }

            // prepare context args from url
            const variableFromURL = Router.extractVariableFromUrl(routingRule.path, pathFragment, regexp);
            setupContextArgs(context.args, variableFromURL, routingRule.controller.id, true);

            // prepare context args from routing rule
            let somethingWrongInPrepareData = false;

            if (routingRule.prepareData) {
                const result = await Router.prepareData(routingRule.prepareData, context.args);
                somethingWrongInPrepareData = result.somethingWrongInPrepareData;
                setupContextArgs(context.args, result.data, routingRule.controller.id);
            }

            if (somethingWrongInPrepareData) {
                console.warn(`something wrong in ${routingRule.controller.id} prepare data$`);
            }

            // load dependency
            // as server side render appealed to performance, so skip to load dependencies in render server
            // if u need to use third-paty libary in render function please use npm install and add varaible to fake-browser.js
            if (!context.isServerSideRender) {
                const loader = new Loader();
                if (routingRule.dependency) {
                    await loader.load(routingRule.dependency);
                }
            }

            // execute controller
            let htmlPath = null;
            if (routingRule.html) {
                htmlPath = routingRule.html;
            }
            await Router.executeController(routingRule.controller, context, htmlPath, parentControllerInstance);
        }
        document.querySelectorAll('.child-router').forEach((el) => {
            el.style.visibility = '';
        });
        document.querySelectorAll('.loading').forEach((el) => {
            el.removeClass('loading');
        });
        if (!context.isUpdateDOMFirstRunRouting) {
            let cursorIndex = 0;
            let firstHTMLExistsController = window.SwimAppController[cursorIndex];
            while (!firstHTMLExistsController.elHTML) {
                cursorIndex += 1;
                firstHTMLExistsController = window.SwimAppController[cursorIndex];
            }
            const elContainer = firstHTMLExistsController.elShadowHTML.parentElement;
            let child = elContainer.lastElementChild;
            while (child) {
                elContainer.removeChild(child);
                child = elContainer.lastElementChild;
            }
            elContainer.appendChild(firstHTMLExistsController.elHTML);
        }
        context.isUpdateDOMFirstRunRouting = true; // eslint-disable-line
    },
    findMatchRoute: (currentPath, routers) => {
        for (let i = 0; i < routers.length; i++) {
            const path = routers[i].path;
            const isEnd = routers[i].children === undefined;
            const regexp = Router.buildRegExp(path, isEnd);
            if (regexp.test(currentPath)) {
                return routers[i];
            }
        }
    },
    findControllerInstance: (type) => {
        if (!type) {
            return null;
        }
        return window.SwimAppController.filter((instance) => {
            return instance instanceof type;
        })[0];
    },
    // server side: constructor -> render
    // client side first time: constructor -> enter -> render -> postRender -> exit
    // client side seconds time: enter -> render -> postRender -> exit
    executeController: async (Controller, context, htmlPath, parentController, skipControllerLiveTimeCycle) => {
        // 如果已經有 instance 就不要在執行 initalize
        const instances = window.SwimAppController.filter((instance) => {
            return instance instanceof Controller;
        });

        let controllerInstance = null;
        let elHTML = null;
        if (instances.length === 0) {
            if (htmlPath) {
                const loader = new Loader();
                let html = await loader.loadHTML(htmlPath);
                html = Render.appendStylesheetToHeadAndRemoveLoaded(html);
                elHTML = html.toDom();
            }
            controllerInstance = new Controller(elHTML, parentController, context.args, context);
            window.SwimAppController.push(controllerInstance);
        } else {
            controllerInstance = instances[0];
        }

        window.AppCurrentController = controllerInstance; // eslint-disable-line
        if (!skipControllerLiveTimeCycle) {
            if (!context.isServerSideRender) { // client side only
                // client side every time enter router
                await controllerInstance.enter(context.args);
                if (controllerInstance.render) {
                    await controllerInstance.render();
                }
                if (controllerInstance.postRender) {
                    await controllerInstance.postRender();
                }
            } else if (controllerInstance.render) {
                await controllerInstance.render(true);
            }
        }

        return controllerInstance;
    },
    prepareData: (prepareFuncs, args) => {
        return new Promise(async (resolve) => { // eslint-disable-line
            let somethingWrongInPrepareData = false;
            const data = {};
            const tempArgs = {
                ...args
            };
            if (prepareFuncs && prepareFuncs.length > 0) {
                for (let i = 0; i < prepareFuncs.length; i++) {
                    const prepareData = await prepareFuncs[i].func(tempArgs);
                    if (prepareData === null || prepareData === undefined) {
                        somethingWrongInPrepareData = true;
                    }
                    const key = prepareFuncs[i].key;
                    tempArgs[key] = prepareData;
                    data[key] = prepareData;
                }
            }
            resolve({
                somethingWrongInPrepareData,
                data
            });
        });
    },
    buildRegExp: (path, isEnd) => {
        const arrayOfPath = path.split('?')[0].split('/');
        const arrayRegString = [];
        const arrayUrlParams = [];
        for (let j = 0; j < arrayOfPath.length; j++) {
            if (arrayOfPath[j].substring(0, 1) === '{') {
                arrayUrlParams.push(arrayOfPath[j].replace(/{/gi, '').replace(/}/gi, ''));
                arrayRegString.push('([0-9a-zA-Z_\\-\\}\\{]+)');
            } else {
                arrayRegString.push(arrayOfPath[j]);
            }
        }
        if (isEnd) {
            return new RegExp('^' + arrayRegString.join('\\/') + '(\\?.*)?$');
        } else {
            return new RegExp('^' + arrayRegString.join('\\/'));
        }
    },
    extractVariableFromUrl: (routingPath, currentPath, regexp) => {
        const arrayRoutingPath = routingPath.split('?');
        routingPath = arrayRoutingPath[0];
        const keys = routingPath.match(regexp);
        const values = Array.isArray(currentPath) ? currentPath.join('/').match(regexp) : currentPath.match(regexp);
        const args = {};
        if (keys !== null && keys !== undefined && keys.length > 1 && keys.length === values.length) {
            for (let j = 1; j < keys.length; j++) {
                if (keys[j] === undefined) {
                    continue;
                }
                const key = keys[j].replace(/{/gi, '').replace(/}/gi, '');
                const value = values[j];
                args[key] = value;
            }
        }
        // 怎麼記得 location.search -> currentPath 現在好像又改回 currentPath;
        // currentPath 會有 queryString 不知道為什麼這裡要這樣處理
        // if (location.search !== '?' && currentPath.indexOf('?') === -1) {
        //     currentPath += location.search;
        // }
        if (arrayRoutingPath.length === 2 && currentPath.indexOf('?') !== -1) {
            const arrayQueryStringFromRouting = arrayRoutingPath[1].split('&');
            const arrayQueryStringFromCurrentPath = currentPath.split('?')[1].split('&');
            for (let i = 0; i < arrayQueryStringFromRouting.length; i++) {
                for (let j = 0; j < arrayQueryStringFromCurrentPath.length; j++) {
                    if (arrayQueryStringFromCurrentPath[j].indexOf(arrayQueryStringFromRouting[i] + '=') !== -1) {
                        const queryKey = arrayQueryStringFromRouting[i];
                        const queryValue = arrayQueryStringFromCurrentPath[j].split('=')[1];
                        args[queryKey] = queryValue;
                    }
                }
            }
        }
        return args;
    },
    getRoutingPathArray: (path, routingRules) => {
        const results = [];
        let currentPath = path;
        let currentRoutingRules = routingRules;
        let isEnd = !(path.length > 0);
        let fullPath = '';
        while (!isEnd) {
            const matchRoutingRule = Router.findMatchRoute(currentPath, currentRoutingRules);
            let regexp = Router.buildRegExp(matchRoutingRule.path, isEnd);
            isEnd = matchRoutingRule.children === undefined || currentPath.split('?')[0].replace(regexp, '').length === 0;
            // re-generate regexp
            if (isEnd) {
                regexp = Router.buildRegExp(matchRoutingRule.path, isEnd);
            }
            fullPath += currentPath.match(regexp)[0];
            results.push({
                fullPath,
                pathFragment: currentPath.match(regexp)[0],
                matchRoutingRule,
                regexp
            });
            currentRoutingRules = matchRoutingRule.children;
            currentPath = currentPath.replace(regexp, '');
        }
        return results;
    }
};

function setupContextArgs (argsReference, args, controllerId, isVariableFromUri) {
    if (!window.SwimAppControllersAndArgsMapping[controllerId]) {
        window.SwimAppControllersAndArgsMapping[controllerId] = [];
    }
    for (const key in args) {
        if (typeof args[key] === 'object' || typeof args[key] === 'function') {
            argsReference[key] = args[key];
            continue;
        }

        if (isVariableFromUri) {
            argsReference[`_${key}`] = decodeURIComponent(args[key]);
        } else {
            argsReference[`_${key}`] = args[key];
        }

        if (argsReference[`${key}`] === undefined && argsReference[`_${key}`] !== undefined) {
            Object.defineProperty(argsReference, key, {
                set: (newValue) => {
                    argsReference[`_${key}`] = newValue;

                    document.body.dispatchEvent(new CustomEvent(`CONTEXT_${Swissknife.CamelToUnderscoreSnake(key).toUpperCase()}_CHANGED`, {
                        bubbles: true,
                        detail: {
                            newValue: newValue
                        }
                    }));
                },
                get: () => {
                    return argsReference[`_${key}`];
                },
                configurable: true
            });
        }

        if (window.SwimAppControllersAndArgsMapping[controllerId].indexOf(key) === -1) {
            window.SwimAppControllersAndArgsMapping[controllerId].push(key);
        }
    }
}

function clearContextArgs (argsReference, controllerId) {
    const controllerArgs = window.SwimAppControllersAndArgsMapping[controllerId];
    for (let i = 0; i < controllerArgs.length; i++) {
        const key = controllerArgs[i];
        delete argsReference[key];
    }
}
