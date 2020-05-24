import {Dictionary, RouterType, RouteHandler} from './types.js';

export default class Router {

    private _type: RouterType;
    private _routeCollection: Map<string, RouteHandler>;

    private _isRegExpNamedCaptureGroupsSupport: boolean;

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

        try {
            // RegExp named capture groups unsupported environment will throw regexp syntax error
            const matches = 'RegExp named capturing'.match(new RegExp('(?<name>.+)'));
            this._isRegExpNamedCaptureGroupsSupport = matches?.groups?.name ? true : false;
        }
        catch {
            this._isRegExpNamedCaptureGroupsSupport = false;
        }
    }

    get type(): RouterType {
        return this._type;
    }

    setRoute(pattern: string, handler: RouteHandler): void {
        this._routeCollection.set(pattern, handler);
    }

    removeRoute(pattern: string): void {
        this._routeCollection.delete(pattern);
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

    private _match(url: string, pattern: string, params: Dictionary<string>): boolean {
        // Replace :name to (?<name>[^/?#]+) but don't replace for non-capturing groups like (?:pattern)
        pattern = '/' + pattern; // Temporal first character
        pattern = pattern.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)');
        pattern = pattern.substring(1);

        const groupNames: Array<string> = [];
        if (!this._isRegExpNamedCaptureGroupsSupport) {
            // This is workaround for RegExp named capture groups unsupported environment
            // and does not work expected for capture groups within capture groups like ((pattern)(pattern))
            pattern = pattern.replace(/\([^()]+\)/g, (substr) => {
                if (substr.startsWith('(?:')) {
                    return substr;
                }
                else if (substr.startsWith('(?<')) {
                    return substr.replace(/\(\?<(\w+)>(.+)\)/, (_substr, name, pattern) => {
                        groupNames.push(name);
                        return `(${pattern})`;
                    });
                }
                else {
                    groupNames.push('');
                    return substr;
                }
            });
        }

        const matches = url.match(new RegExp(pattern));
        if (matches) {
            if (this._isRegExpNamedCaptureGroupsSupport && matches.groups) {
                Object.assign(params, matches.groups);
            }
            else if (!this._isRegExpNamedCaptureGroupsSupport && groupNames.length) {
                for (let i = 0; i < groupNames.length; i++) {
                    if (groupNames[i]) {
                        params[groupNames[i]] = matches[i+1];
                    }
                }
            }
            return true;
        }
        return false;
    }

}

/*
// https://example.com/users/123/picture/1
// https://example.com/#/users/123/picture/1
// <a route="/users/123/picture/1"></a>

const router = new Router('hash');

router.setRoute('/users/:uid/((pic)(?:\\w*))/((?<pic1>\\d+)-:pic2)', (params) => {
    console.log(params);
});
router.setRoute('/users/', () => {
    console.log('users');
});
router.setRoute('.*', () => {
    console.log('any');
});

router.navigate('https://example.com/users/1-2_a.b/picture/1-A?key=val#hash');
//router.navigate('/users/');
//router.navigate('/');
*/
