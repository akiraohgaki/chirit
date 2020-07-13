import { RouterType, RouteHandler } from './types.js';
export default class Router {
    private _type;
    private _routeCollection;
    constructor(type: RouterType);
    get type(): RouterType;
    setRoute(route: string, handler: RouteHandler): void;
    removeRoute(route: string): void;
    navigate(url: string): void;
    private _navigateWithHash;
    private _navigateWithHistory;
    private _invoke;
    private _fixRoute;
    private _match;
    private _hashchangeEventHandler;
    private _popstateEventHandler;
}
