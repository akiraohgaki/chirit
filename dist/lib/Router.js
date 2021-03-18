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
    constructor(mode, base = '') {
        if (mode !== 'hash' && mode !== 'history') {
            throw new Error('The mode must be set "hash" or "history".');
        }
        this._mode = mode;
        this._base = (base && !base.endsWith('/')) ? base + '/' : base;
        this._onchange = () => { };
        this._onerror = (exception) => { console.error(exception); };
        this._routeCollection = new Map();
        this._handleHashchange = this._handleHashchange.bind(this);
        this._handlePopstate = this._handlePopstate.bind(this);
    }
    get mode() {
        return this._mode;
    }
    get base() {
        return this._base;
    }
    set onchange(handler) {
        this._onchange = handler;
    }
    get onchange() {
        return this._onchange;
    }
    set onerror(handler) {
        this._onerror = handler;
    }
    get onerror() {
        return this._onerror;
    }
    setRoute(pattern, handler) {
        if (!this._routeCollection.size) {
            if (this._mode === 'hash') {
                window.addEventListener('hashchange', this._handleHashchange);
            }
            else if (this._mode === 'history') {
                window.addEventListener('popstate', this._handlePopstate);
            }
        }
        this._routeCollection.set(this._fixRoutePattern(pattern), handler);
    }
    removeRoute(pattern) {
        this._routeCollection.delete(this._fixRoutePattern(pattern));
        if (!this._routeCollection.size) {
            if (this._mode === 'hash') {
                window.removeEventListener('hashchange', this._handleHashchange);
            }
            else if (this._mode === 'history') {
                window.removeEventListener('popstate', this._handlePopstate);
            }
        }
    }
    navigate(url) {
        if (this._mode === 'hash') {
            this._navigateWithHashMode(url);
        }
        else if (this._mode === 'history') {
            this._navigateWithHistoryMode(url);
        }
    }
    _navigateWithHashMode(url) {
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
        const newVirtualUrl = new URL(this._resolveBaseUrl(newVirtualPath), oldVirtualUrl.href);
        if (newVirtualUrl.pathname !== oldVirtualPath) {
            window.location.hash = newVirtualUrl.pathname;
            return;
        }
        this._invokeRouteHandler(newVirtualUrl.pathname);
    }
    _navigateWithHistoryMode(url) {
        const newUrl = new URL(this._resolveBaseUrl(url), window.location.href);
        if (newUrl.origin !== window.location.origin) {
            window.location.href = newUrl.href;
            return;
        }
        if (newUrl.href !== window.location.href) {
            window.history.pushState({}, '', newUrl.href);
            this._onchange(new CustomEvent('pushstate'));
        }
        this._invokeRouteHandler(newUrl.pathname);
    }
    _handleHashchange(event) {
        this._onchange(event);
        this._invokeRouteHandler(window.location.hash.substring(1));
    }
    _handlePopstate(event) {
        this._onchange(event);
        this._invokeRouteHandler(window.location.pathname);
    }
    _invokeRouteHandler(path) {
        try {
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
        catch (exception) {
            this._onerror(exception);
        }
    }
    _resolveBaseUrl(url) {
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
//# sourceMappingURL=Router.js.map