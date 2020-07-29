import {Dictionary, RouterType, RouteHandler} from './types.js';

let isRegExpNamedCaptureGroupsAvailable = false;
try {
    // RegExp throw regexp syntax error if RegExp named capture groups is not available
    const matches = 'Named capture groups'.match(/(?<name>.+)/);
    isRegExpNamedCaptureGroupsAvailable = matches?.groups?.name ? true : false;
}
catch {
    isRegExpNamedCaptureGroupsAvailable = false;
}

export default class Router {

    private _type: RouterType;
    private _routeCollection: Map<string, RouteHandler>;

    constructor(type: RouterType) {
        this._type = type;
        this._routeCollection = new Map();

        this._handleHashchangeEvent = this._handleHashchangeEvent.bind(this);
        this._handlePopstateEvent = this._handlePopstateEvent.bind(this);
    }

    get type(): RouterType {
        return this._type;
    }

    setRoute(route: string, handler: RouteHandler): void {
        if (!this._routeCollection.size) {
            switch (this._type) {
                case 'hash': {
                    window.addEventListener('hashchange', this._handleHashchangeEvent, false);
                    break;
                }
                case 'history': {
                    window.addEventListener('popstate', this._handlePopstateEvent, false);
                    break;
                }
            }
        }

        this._routeCollection.set(this._fixRoute(route), handler);
    }

    removeRoute(route: string): void {
        this._routeCollection.delete(this._fixRoute(route));

        if (!this._routeCollection.size) {
            switch (this._type) {
                case 'hash': {
                    window.removeEventListener('hashchange', this._handleHashchangeEvent, false);
                    break;
                }
                case 'history': {
                    window.removeEventListener('popstate', this._handlePopstateEvent, false);
                    break;
                }
            }
        }
    }

    navigate(url: string): void {
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

    private _navigateWithHash(url: string): void {
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
        const newVirtualUrl = new URL(newVirtualPath, oldVirtualUrl.href);

        if (newVirtualUrl.pathname !== oldVirtualPath) {
            window.location.hash = newVirtualUrl.pathname;
            return;
        }

        this._invoke(newVirtualUrl.pathname);
    }

    private _navigateWithHistory(url: string): void {
        const newUrl = new URL(url, window.location.href);

        if (newUrl.origin !== window.location.origin) {
            window.location.href = newUrl.href;
            return;
        }

        if (newUrl.href !== window.location.href) {
            window.history.pushState({}, '', newUrl.href);
        }
        this._invoke(newUrl.pathname);
    }

    private _invoke(path: string): void {
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

    private _handleHashchangeEvent(): void {
        this._invoke(window.location.hash.substring(1));
    }

    private _handlePopstateEvent(): void {
        this._invoke(window.location.pathname);
    }

}
