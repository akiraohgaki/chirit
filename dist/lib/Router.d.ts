import { RouterMode, RouteHandler } from './types.js';
export default class Router {
    private _mode;
    private _base;
    private _routeCollection;
    constructor(mode: RouterMode, base?: string);
    get mode(): RouterMode;
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
