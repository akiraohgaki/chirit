var _a;
let isRegExpNamedCaptureGroupsAvailable = false;
try {
    const matches = 'Named capture groups'.match(/(?<name>.+)/);
    isRegExpNamedCaptureGroupsAvailable = ((_a = matches === null || matches === void 0 ? void 0 : matches.groups) === null || _a === void 0 ? void 0 : _a.name) ? true : false;
}
catch (_b) {
    isRegExpNamedCaptureGroupsAvailable = false;
}
export default class Router {
    constructor(type, base = '') {
        this._type = type;
        this._base = (base && !base.endsWith('/')) ? base + '/' : base;
        this._routeCollection = new Map();
        this._handleHashchangeEvent = this._handleHashchangeEvent.bind(this);
        this._handlePopstateEvent = this._handlePopstateEvent.bind(this);
    }
    get type() {
        return this._type;
    }
    get base() {
        return this._base;
    }
    setRoute(route, handler) {
        if (!this._routeCollection.size) {
            switch (this._type) {
                case 'hash': {
                    window.addEventListener('hashchange', this._handleHashchangeEvent);
                    break;
                }
                case 'history': {
                    window.addEventListener('popstate', this._handlePopstateEvent);
                    break;
                }
            }
        }
        this._routeCollection.set(this._fixRoute(route), handler);
    }
    removeRoute(route) {
        this._routeCollection.delete(this._fixRoute(route));
        if (!this._routeCollection.size) {
            switch (this._type) {
                case 'hash': {
                    window.removeEventListener('hashchange', this._handleHashchangeEvent);
                    break;
                }
                case 'history': {
                    window.removeEventListener('popstate', this._handlePopstateEvent);
                    break;
                }
            }
        }
    }
    navigate(url) {
        switch (this._type) {
            case 'hash': {
                this._navigateWithHash(url);
                break;
            }
            case 'history': {
                this._navigateWithHistory(url);
                break;
            }
        }
    }
    _navigateWithHash(url) {
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
        newVirtualPath = this._fixUrl(newVirtualPath);
        const oldVirtualPath = window.location.hash.substring(1);
        const oldVirtualUrl = new URL(oldVirtualPath, window.location.origin);
        const newVirtualUrl = new URL(newVirtualPath, oldVirtualUrl.href);
        if (newVirtualUrl.pathname !== oldVirtualPath) {
            window.location.hash = newVirtualUrl.pathname;
            return;
        }
        this._invokeRouteHandler(newVirtualUrl.pathname);
    }
    _navigateWithHistory(url) {
        const newPath = this._fixUrl(url);
        const newUrl = new URL(newPath, window.location.href);
        if (newUrl.origin !== window.location.origin) {
            window.location.href = newUrl.href;
            return;
        }
        if (newUrl.href !== window.location.href) {
            window.history.pushState({}, '', newUrl.href);
        }
        this._invokeRouteHandler(newUrl.pathname);
    }
    _invokeRouteHandler(path) {
        if (this._routeCollection.size) {
            for (const [route, handler] of this._routeCollection) {
                const params = this._match(path, route);
                if (params) {
                    handler(params);
                    break;
                }
            }
        }
    }
    _fixRoute(route) {
        return `/${route}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
    }
    _fixUrl(url) {
        return (this._base && url.search(/^(https?:\/\/|\/)/i) === -1) ? this._base + url : url;
    }
    _match(path, route) {
        const params = {};
        if (isRegExpNamedCaptureGroupsAvailable) {
            const matches = path.match(new RegExp(route));
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
            const routePatternA = route.replace(namedGroupRegExp, (_substring, name, pattern) => {
                groupNames.push(name);
                return `(${pattern})`;
            });
            const routePatternB = route.replace(namedGroupRegExp, '(?:$2)');
            const matchesA = path.match(new RegExp(routePatternA));
            const matchesB = path.match(new RegExp(routePatternB));
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
    _handleHashchangeEvent() {
        this._invokeRouteHandler(window.location.hash.substring(1));
    }
    _handlePopstateEvent() {
        this._invokeRouteHandler(window.location.pathname);
    }
}
//# sourceMappingURL=Router.js.map