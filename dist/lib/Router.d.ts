import type { OnEventHandler, OnErrorHandler, RouteHandler, RouterMode } from './types.js';
export default class Router {
    private _mode;
    private _base;
    private _onchange;
    private _onerror;
    private _routeCollection;
    constructor(mode: RouterMode, base?: string);
    get mode(): RouterMode;
    get base(): string;
    set onchange(handler: OnEventHandler);
    get onchange(): OnEventHandler;
    set onerror(handler: OnErrorHandler);
    get onerror(): OnErrorHandler;
    setRoute(pattern: string, handler: RouteHandler): void;
    removeRoute(pattern: string): void;
    navigate(url: string): void;
    private _navigateWithHashMode;
    private _navigateWithHistoryMode;
    private _handleHashchange;
    private _handlePopstate;
    private _invokeRouteHandler;
    private _resolveBaseUrl;
    private _fixRoutePattern;
    private _match;
}
