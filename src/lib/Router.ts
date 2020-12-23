import {Dictionary, RouterMode, RouteHandler} from './types.js';

let isRegExpNamedCaptureGroupsAvailable = false;
try {
    // RegExp throw regexp syntax error if RegExp named capture groups is not available
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

    setRoute(route: string, handler: RouteHandler): void {
        if (!this._routeCollection.size) {
            this.addEventListener();
        }

        this._routeCollection.set(this._fixRoute(route), handler);
    }

    removeRoute(route: string): void {
        this._routeCollection.delete(this._fixRoute(route));

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

    protected fixUrl(url: string): string {
        return (this._base && url.search(/^(https?:\/\/|\/)/i) === -1) ? this._base + url : url;
    }

    private _fixRoute(route: string): string {
        // Replace :name to (?<name>[^/?#]+) but don't replace for non-capturing groups like (?:pattern)
        // Just in case if the string starts with ":", prepend "/" to the string then remove it after the replace work
        return `/${route}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
    }

    private _match(path: string, route: string): Dictionary<string> | null {
        const params: Dictionary<string> = {};

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
            // This is workaround for RegExp named capture groups unsupported environment
            // and does not work expected for named capture groups within named capture groups like (?<name>(?<name>pattern))
            const groupNames: Array<string> = [];

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

}

class HashModeRouter extends RouterBase {

    constructor(base: string = '') {
        super(base);

        this._handleHashchangeEvent = this._handleHashchangeEvent.bind(this);
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

        newVirtualPath = this.fixUrl(newVirtualPath);

        const oldVirtualPath = window.location.hash.substring(1);
        const oldVirtualUrl = new URL(oldVirtualPath, window.location.origin);
        const newVirtualUrl = new URL(newVirtualPath, oldVirtualUrl.href);

        if (newVirtualUrl.pathname !== oldVirtualPath) {
            window.location.hash = newVirtualUrl.pathname;
            return;
        }

        this.invokeRouteHandler(newVirtualUrl.pathname);
    }

    protected addEventListener(): void {
        window.addEventListener('hashchange', this._handleHashchangeEvent);
    }

    protected removeEventListener(): void {
        window.removeEventListener('hashchange', this._handleHashchangeEvent);
    }

    private _handleHashchangeEvent(): void {
        this.invokeRouteHandler(window.location.hash.substring(1));
    }

}

class HistoryModeRouter extends RouterBase {

    constructor(base: string = '') {
        super(base);

        this._handlePopstateEvent = this._handlePopstateEvent.bind(this);
    }

    navigate(url: string): void {
        const newPath = this.fixUrl(url);
        const newUrl = new URL(newPath, window.location.href);

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
        window.addEventListener('popstate', this._handlePopstateEvent);
    }

    protected removeEventListener(): void {
        window.removeEventListener('popstate', this._handlePopstateEvent);
    }

    private _handlePopstateEvent(): void {
        this.invokeRouteHandler(window.location.pathname);
    }

}

export default class Router {

    private _mode: RouterMode;

    private _router: HashModeRouter | HistoryModeRouter;

    constructor(mode: RouterMode, base: string = '') {
        this._mode = mode;

        switch (this._mode) {
            case 'hash': {
                this._router = new HashModeRouter(base);
                break;
            }
            case 'history': {
                this._router = new HistoryModeRouter(base);
                break;
            }
        }
    }

    get mode(): RouterMode {
        return this._mode;
    }

    get base(): string {
        return this._router.base;
    }

    setRoute(route: string, handler: RouteHandler): void {
        this._router.setRoute(route, handler);
    }

    removeRoute(route: string): void {
        this._router.removeRoute(route);
    }

    navigate(url: string): void {
        this._router.navigate(url);
    }

}
