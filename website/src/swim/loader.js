window.SwimAppLoaderCache = [];

export class Loader {
    constructor () {
        this.max = 300;
        this.checkCount = 0;
    }

    async load (dependency) {
        for (let i = 0; i < dependency.length; i++) {
            if (dependency[i]) {
                const loader = new Loader();
                await loader.load(dependency[i]);
            }
        }
        await this._load(dependency);
    }

    async loadHTML (url) {
        if (window.SwimAppLoaderCache[url]) {
            return window.SwimAppLoaderCache[url];
        }
        if (window.SwimAppLoaderCache[url] === '') {
            return new Promise((resolve, reject) => {
                const checkTemplate = () => {
                    if (window.SwimAppLoaderCache[url] === '') {
                        setTimeout(checkTemplate, 10);
                    } else {
                        resolve(window.SwimAppLoaderCache[url]);
                    }
                };
                checkTemplate();
            });
        }
        window.SwimAppLoaderCache[url] = '';
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        });
        const result = await resp.text();
        if (resp.status === 200) {
            window.SwimAppLoaderCache[url] = result;
        }
        return result;
    }

    async loadJS (url, moduleName) {
        return new Promise((resolve, reject) => {
            import(url).then((module) => {
                for (const key in module) {
                    if (key === moduleName) {
                        resolve(module[key]);
                    }
                }
                reject(new Error('loadJS Error'));
            });
        });
    }

    async _load (dependency) {
        for (let i = 0; i < dependency.length; i++) {
            if (!window[dependency[i].checkVariable] && window.SwimAppLoaderCache.indexOf(dependency[i].url) === -1) {
                const script = document.createElement('script');
                script.src = dependency[i].url;
                if (dependency[i].defer) {
                    script.defer = true;
                }
                if (dependency[i].async) {
                    script.async = true;
                }
                document.body.appendChild(script);
                window.SwimAppLoaderCache.push(dependency[i].url);
            }
        }

        return new Promise((resolve, reject) => {
            this._check(dependency, resolve, reject);
        });
    }

    async _check (dependency, resolve, reject) {
        let isReady = true;
        for (let i = 0; i < dependency.length; i++) {
            if (dependency[i].checkVariable && !window[dependency[i].checkVariable]) {
                isReady = false;
                break;
            }
        }

        if (isReady) {
            resolve();
        } else {
            this.checkCount += 1;
            if (this.checkCount < this.max) {
                setTimeout(() => {
                    this._check(dependency, resolve, reject);
                }, 10);
            } else {
                // refactor throw error
                console.error(dependency);
                resolve();
            }
        }
    }
}
