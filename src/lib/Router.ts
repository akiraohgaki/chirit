import {Dictionary, RouterType, RouteHandler} from './types.js';

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
        // Replace :name to (?<name>\w+) but don't replace if it is (?:pattern)
        pattern = pattern.replace(/([^?]):(\w+)/g, '$1(?<$2>\w+)');

        const match = url.match(new RegExp(pattern, 'g'));
        if (match) {
            if (match.groups) {
                Object.assign(params, match.groups);
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

router.setRoute('/users/:uid/pic(\w*)/:pic', (params) => {
    console.log(params.uid, params.pic);
});
router.setRoute('/users/', () => {});
router.setRoute('.*', () => {});

router.navigate('/users/123/picture/1');
*/
