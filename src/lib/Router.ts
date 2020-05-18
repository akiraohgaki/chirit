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

    navigate(path: string): void {
        if (this._routeCollection.size) {
            for (const [pattern, handler] of this._routeCollection) {
                const params = {};
                if (this._match(path, pattern, params)) {
                    handler(params);
                    break;
                }
            }
        }
    }

    private _match(path: string, pattern: string, params: Dictionary<string>): boolean {
        const match = path.match(new RegExp(pattern, 'gi'));
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
// https://example.com/users/123
// https://example.com/#/users/123
// <a route="/users/123"></a>

const router = new Router('hash');

router.setRoute('/users/(?<uid>.+)', (params) => {
    console.log(params.uid);
});
router.setRoute('/users/', () => {});
router.setRoute('.*', () => {});

router.navigate('/users/123');
*/
