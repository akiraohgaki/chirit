var _a;
let isRegExpNamedCaptureGroupsAvailable = false;
try {
    const matches = 'Named capture groups'.match(/(?<name>.+)/);
    isRegExpNamedCaptureGroupsAvailable = ((_a = matches === null || matches === void 0 ? void 0 : matches.groups) === null || _a === void 0 ? void 0 : _a.name) ? true : false;
}
catch (_b) {
    isRegExpNamedCaptureGroupsAvailable = false;
}
class RouterBase {
    constructor(base = '') {
        this._base = (base && !base.endsWith('/')) ? base + '/' : base;
        this._routeCollection = new Map();
    }
    get base() {
        return this._base;
    }
    setRoute(pattern, handler) {
        if (!this._routeCollection.size) {
            this.addEventListener();
        }
        this._routeCollection.set(this._fixRoutePattern(pattern), handler);
    }
    removeRoute(pattern) {
        this._routeCollection.delete(this._fixRoutePattern(pattern));
        if (!this._routeCollection.size) {
            this.removeEventListener();
        }
    }
    navigate(_url) {
    }
    addEventListener() {
    }
    removeEventListener() {
    }
    invokeRouteHandler(path) {
        if (this._routeCollection.size) {
            for (const [pattern, handler] of this._routeCollection) {
                const params = this._match(path, pattern);
                if (params) {
                    handler(params);
                    break;
                }
            }
        }
    }
    resolveBaseUrl(url) {
        return (this._base && url.search(/^(https?:\/\/|\/)/i) === -1) ? this._base + url : url;
    }
    _fixRoutePattern(pattern) {
        return `/${pattern}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
    }
    _match(path, pattern) {
        const params = {};
        if (isRegExpNamedCaptureGroupsAvailable) {
            const matches = path.match(new RegExp(pattern));
            if (matches) {
                if (matches.groups) {
                    Object.assign(params, matches.groups);
                }
                return params;
            }
        }
        else {
            const groupNames = [];
            const namedGroupRegExp = /\(\?<(\w+)>([^()]+)\)/g;
            const patternA = pattern.replace(namedGroupRegExp, (_substring, groupName, groupPattern) => {
                groupNames.push(groupName);
                return `(${groupPattern})`;
            });
            const patternB = pattern.replace(namedGroupRegExp, '(?:$2)');
            const matchesA = path.match(new RegExp(patternA));
            const matchesB = path.match(new RegExp(patternB));
            if (matchesA && matchesB) {
                if (groupNames.length) {
                    let iN = 0;
                    let iB = 1;
                    for (let iA = 1; iA < matchesA.length; iA++) {
                        if (matchesA[iA] === matchesB[iB]) {
                            iB++;
                        }
                        else {
                            params[groupNames[iN]] = matchesA[iA];
                            iN++;
                        }
                    }
                }
                return params;
            }
        }
        return null;
    }
}
class HashRouter extends RouterBase {
    constructor(base = '') {
        super(base);
        this._handleHashchangeEvent = this._handleHashchangeEvent.bind(this);
    }
    navigate(url) {
        var _a;
        let newVirtualPath = '';
        if (url.search(/^https?:\/\/|\?|#/i) !== -1) {
            const newUrl = new URL(url, window.location.href);
            const newUrlParts = newUrl.href.split('#');
            const oldUrlParts = window.location.href.split('#');
            if (newUrlParts[0] !== oldUrlParts[0]) {
                window.location.href = newUrl.href;
                return;
            }
            newVirtualPath = (_a = newUrlParts[1]) !== null && _a !== void 0 ? _a : '';
        }
        else {
            newVirtualPath = url;
        }
        const oldVirtualPath = window.location.hash.substring(1);
        const oldVirtualUrl = new URL(oldVirtualPath, window.location.origin);
        const newVirtualUrl = new URL(this.resolveBaseUrl(newVirtualPath), oldVirtualUrl.href);
        if (newVirtualUrl.pathname !== oldVirtualPath) {
            window.location.hash = newVirtualUrl.pathname;
            return;
        }
        this.invokeRouteHandler(newVirtualUrl.pathname);
    }
    addEventListener() {
        window.addEventListener('hashchange', this._handleHashchangeEvent);
    }
    removeEventListener() {
        window.removeEventListener('hashchange', this._handleHashchangeEvent);
    }
    _handleHashchangeEvent() {
        this.invokeRouteHandler(window.location.hash.substring(1));
    }
}
class HistoryRouter extends RouterBase {
    constructor(base = '') {
        super(base);
        this._handlePopstateEvent = this._handlePopstateEvent.bind(this);
    }
    navigate(url) {
        const newUrl = new URL(this.resolveBaseUrl(url), window.location.href);
        if (newUrl.origin !== window.location.origin) {
            window.location.href = newUrl.href;
            return;
        }
        if (newUrl.href !== window.location.href) {
            window.history.pushState({}, '', newUrl.href);
        }
        this.invokeRouteHandler(newUrl.pathname);
    }
    addEventListener() {
        window.addEventListener('popstate', this._handlePopstateEvent);
    }
    removeEventListener() {
        window.removeEventListener('popstate', this._handlePopstateEvent);
    }
    _handlePopstateEvent() {
        this.invokeRouteHandler(window.location.pathname);
    }
}
export default class Router {
    constructor(mode, base = '') {
        this._mode = mode;
        switch (this._mode) {
            case 'hash': {
                this._router = new HashRouter(base);
                break;
            }
            case 'history': {
                this._router = new HistoryRouter(base);
                break;
            }
        }
    }
    get mode() {
        return this._mode;
    }
    get base() {
        return this._router.base;
    }
    setRoute(pattern, handler) {
        this._router.setRoute(pattern, handler);
    }
    removeRoute(pattern) {
        this._router.removeRoute(pattern);
    }
    navigate(url) {
        this._router.navigate(url);
    }
}
//# sourceMappingURL=Router.js.map