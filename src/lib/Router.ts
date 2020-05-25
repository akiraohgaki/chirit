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

        switch (this._type) {
            case 'hash': {
                //...
                break;
            }
            case 'history': {
                //...
                break;
            }
        }
    }

    get type(): RouterType {
        return this._type;
    }

    setRoute(pattern: string, handler: RouteHandler): void {
        this._routeCollection.set(this._fixPattern(pattern), handler);
    }

    removeRoute(pattern: string): void {
        this._routeCollection.delete(this._fixPattern(pattern));
    }

    navigate(url: string): void {
        if (this._routeCollection.size) {
            for (const [pattern, handler] of this._routeCollection) {
                const params = {};
                if (this._match(url, pattern, params)) {
                    handler(params);
                    break;
                }
            }
        }
    }

    private _fixPattern(pattern: string): string {
        // Replace :name to (?<name>[^/?#]+) but don't replace for non-capturing groups like (?:pattern)
        return `/${pattern}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
    }

    private _match(url: string, pattern: string, params: Dictionary<string>): boolean {
        if (isRegExpNamedCaptureGroupsAvailable) {
            const matches = url.match(new RegExp(pattern));
            if (matches) {
                if (matches.groups) {
                    Object.assign(params, matches.groups);
                }
                return true;
            }
            return false;
        }
        else {
            // This is workaround for RegExp named capture groups unsupported environment
            // and does not work expected for named capture groups within named capture groups like (?<name>(?<name>pattern))
            const groupNames: Array<string> = [];

            const namedGroupRegExp = /\(\?<(\w+)>([^()]+)\)/g;
            const patternA = pattern.replace(namedGroupRegExp, (_substring, name, pattern) => {
                groupNames.push(name);
                return `(${pattern})`;
            });
            const patternB = pattern.replace(namedGroupRegExp, '(?:$2)');

            const matchesA = url.match(new RegExp(patternA));
            const matchesB = url.match(new RegExp(patternB));

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
                return true;
            }
            return false;
        }
    }

}
