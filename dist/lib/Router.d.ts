import { RouterType, RouteHandler } from './types.js';
export default class Router {
    private _type;
    private _base;
    private _routeCollection;
    constructor(type: RouterType, base?: string);
    get type(): RouterType;
    get base(): string;
    setRoute(route: string, handler: RouteHandler): void;
    removeRoute(route: string): void;
    navigate(url: string): void;
    private _navigateWithHash;
    private _navigateWithHistory;
    private _invokeRouteHandler;
    private _fixRoute;
    private _fixUrl;
    private _match;
    private _handleHashchangeEvent;
    private _handlePopstateEvent;
}
