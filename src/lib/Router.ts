import type {Dictionary, OnErrorHandler, RouteHandler, RouterMode} from './types.js';

// Checks if ES2018 RegExp named capture groups is available
let isRegExpNamedCaptureGroupsAvailable = false;
try {
    // RegExp will throw a regexp syntax error if RegExp named capture groups is not available
    const matches = 'Named capture groups'.match(/(?<name>.+)/);
    isRegExpNamedCaptureGroupsAvailable = matches?.groups?.name ? true : false;
}
catch {
    isRegExpNamedCaptureGroupsAvailable = false;
}

class RouterBase {

    private _base: string;

    private _routeCollection: Map<string, RouteHandler>;

    constructor(base: string = '') {
        this._base = (base && !base.endsWith('/')) ? base + '/' : base;

        this._routeCollection = new Map();
    }

    get base(): string {
        return this._base;
    }

    set onerror(handler: OnErrorHandler) {
        this._onerror = handler;
    }

    get onerror(): OnErrorHandler {
        return this._onerror;
    }

    setRoute(pattern: string, handler: RouteHandler): void {
        if (!this._routeCollection.size) {
            this.addEventListener();
        }

        this._routeCollection.set(this._fixRoutePattern(pattern), handler);
    }

    removeRoute(pattern: string): void {
        this._routeCollection.delete(this._fixRoutePattern(pattern));

        if (!this._routeCollection.size) {
            this.removeEventListener();
        }
    }

    navigate(_url: string): void {
    }

    protected addEventListener(): void {
    }

    protected removeEventListener(): void {
    }

    protected invokeRouteHandler(path: string): void {
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

    protected resolveBaseUrl(url: string): string {
        return (this._base && url.search(/^(https?:\/\/|\/)/i) === -1) ? this._base + url : url;
    }

    private _fixRoutePattern(pattern: string): string {
        // Replace :name to (?<name>[^/?#]+) but don't replace if it's a part of non-capturing groups (?:pattern)
        // The pattern may start with ":" so prefix the pattern with "/" and remove it when the replacement complete
        return `/${pattern}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
    }

    private _match(path: string, pattern: string): Dictionary<string> | null {
        const params: Dictionary<string> = {};

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
            // Here is a workaround for environments that not supported RegExp named capture groups
            // And does not work expected in case of named capture groups inside of named capture groups (?<name>(?<name>pattern))
            const groupNames: Array<string> = [];

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

    private _onerror(exception: any): void {
        console.error(exception);
    }

}

class HashRouter extends RouterBase {

    constructor(base: string = '') {
        // The base should be the base path part of the path represented with URL fragment
        super(base);

        this._handleHashchange = this._handleHashchange.bind(this);
    }

    navigate(url: string): void {
        let newVirtualPath = '';

        if (url.search(/^https?:\/\/|\?|#/i) !== -1) {
            const newUrl = new URL(url, window.location.href);
            const newUrlParts = newUrl.href.split('#');
            const oldUrlParts = window.location.href.split('#');

            if (newUrlParts[0] !== oldUrlParts[0]) {
                window.location.href = newUrl.href;
                return;
            }

            newVirtualPath = newUrlParts[1] ?? '';
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

    protected addEventListener(): void {
        window.addEventListener('hashchange', this._handleHashchange);
    }

    protected removeEventListener(): void {
        window.removeEventListener('hashchange', this._handleHashchange);
    }

    private _handleHashchange(): void {
        this.invokeRouteHandler(window.location.hash.substring(1));
    }

}

class HistoryRouter extends RouterBase {

    constructor(base: string = '') {
        super(base);

        this._handlePopstate = this._handlePopstate.bind(this);
    }

    navigate(url: string): void {
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

    protected addEventListener(): void {
        window.addEventListener('popstate', this._handlePopstate);
    }

    protected removeEventListener(): void {
        window.removeEventListener('popstate', this._handlePopstate);
    }

    private _handlePopstate(): void {
        this.invokeRouteHandler(window.location.pathname);
    }

}

export default class Router {

    private _mode: RouterMode;

    private _router: HashRouter | HistoryRouter;

    constructor(mode: RouterMode, base: string = '') {
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
            default: {
                throw new Error('The mode must be set "hash" or "history".');
            }
        }
    }

    get mode(): RouterMode {
        return this._mode;
    }

    get base(): string {
        return this._router.base;
    }

    set onerror(handler: OnErrorHandler) {
        this._router.onerror = handler;
    }

    get onerror(): OnErrorHandler {
        return this._router.onerror;
    }

    setRoute(pattern: string, handler: RouteHandler): void {
        this._router.setRoute(pattern, handler);
    }

    removeRoute(pattern: string): void {
        this._router.removeRoute(pattern);
    }

    navigate(url: string): void {
        this._router.navigate(url);
    }

}
