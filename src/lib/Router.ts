import {Dictionary, RouterType, RouteHandler} from './types.js';

let isRegExpNamedCaptureGroupsAvailable = false;
try {
    // RegExp named capture groups unsupported environment will throw regexp syntax error
    const matches = 'RegExp named capturing'.match(new RegExp('(?<name>.+)'));
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

        this._hashchangeEventHandler = this._hashchangeEventHandler.bind(this);
        this._popstateEventHandler = this._popstateEventHandler.bind(this);
    }

    get type(): RouterType {
        return this._type;
    }

    setRoute(route: string, handler: RouteHandler): void {
        if (!this._routeCollection.size) {
            switch (this._type) {
                case 'hash': {
                    window.addEventListener('hashchange', this._hashchangeEventHandler);
                    break;
                }
                case 'history': {
                    window.addEventListener('popstate', this._popstateEventHandler);
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
                    window.removeEventListener('hashchange', this._hashchangeEventHandler);
                    break;
                }
                case 'history': {
                    window.removeEventListener('popstate', this._popstateEventHandler);
                    break;
                }
            }
        }
    }

    navigate(url: string): void {
        const urlObj = new URL(url, window.location.href);

        if (urlObj.origin !== window.location.origin) {
            window.location.href = urlObj.href;
            return;
        }

        switch (this._type) {
            case 'hash': {
                // http://host/path/
                //
                // http://host/path/to?k=v#/hash -> http://host/path/to?k=v#/hash
                // to?k=v#/hash -> http://host/path/to?k=v#/hash
                // #/hash -> http://host/path/#/hash
                // /hash -> http://host/hash
                // hash -> http://host/path/hash
                // ../ -> http://host/

                if (urlObj.hash) {
                    if (urlObj.pathname === window.location.pathname
                        && urlObj.search === window.location.search
                    ) {
                        //window.location.hash = urlObj.hash.substring(1);
                    }
                    else {
                        window.location.href = urlObj.href;
                    }
                }
                else {
                    //window.location.hash = urlObj.pathname;
                }
                break;
            }
            case 'history': {
                if (urlObj.href !== window.location.href) {
                    window.history.pushState({}, '', urlObj.href);
                }
                this._navigate(urlObj.pathname);
                break;
            }
        }
    }

    private _navigate(path: string): void {
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

    private _hashchangeEventHandler(): void {
        this._navigate(window.location.hash.substring(1));
    }

    private _popstateEventHandler(): void {
        this._navigate(window.location.pathname);
    }

    private _fixRoute(route: string): string {
        // Replace :name to (?<name>[^/?#]+) but don't replace for non-capturing groups like (?:pattern)
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
