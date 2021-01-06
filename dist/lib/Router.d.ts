import { RouteHandler, RouterMode } from './types.js';
export default class Router {
    private _mode;
    private _router;
    constructor(mode: RouterMode, base?: string);
    get mode(): RouterMode;
    get base(): string;
    setRoute(pattern: string, handler: RouteHandler): void;
    removeRoute(pattern: string): void;
    navigate(url: string): void;
}
