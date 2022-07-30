import type { OnErrorHandler, OnEventHandler, RouteHandler, RouterMode } from './types.ts';

export default class Router {
  private _mode: RouterMode;
  private _base: string;
  private _onchange: OnEventHandler;
  private _onerror: OnErrorHandler;

  private _routeCollection: Map<string, RouteHandler>;

  constructor(mode: RouterMode, base: string = '') {
    if (mode !== 'hash' && mode !== 'history') {
      throw new Error('The mode must be set "hash" or "history".');
    }

    // If the mode is 'hash',
    // the base should be the base path part of the path represented with URL fragment
    this._mode = mode;
    this._base = (base && !base.endsWith('/')) ? base + '/' : base;
    this._onchange = () => {};
    this._onerror = (exception) => {
      console.error(exception);
    };

    this._routeCollection = new Map();

    this._handleHashchange = this._handleHashchange.bind(this);
    this._handlePopstate = this._handlePopstate.bind(this);
  }

  get mode(): RouterMode {
    return this._mode;
  }

  get base(): string {
    return this._base;
  }

  // deno-lint-ignore explicit-module-boundary-types
  set onchange(handler: OnEventHandler) {
    this._onchange = handler;
  }

  get onchange(): OnEventHandler {
    return this._onchange;
  }

  // deno-lint-ignore explicit-module-boundary-types
  set onerror(handler: OnErrorHandler) {
    this._onerror = handler;
  }

  get onerror(): OnErrorHandler {
    return this._onerror;
  }

  setRoute(pattern: string, handler: RouteHandler): void {
    if (!this._routeCollection.size) {
      if (this._mode === 'hash') {
        globalThis.addEventListener('hashchange', this._handleHashchange);
      } else if (this._mode === 'history') {
        globalThis.addEventListener('popstate', this._handlePopstate);
      }
    }

    this._routeCollection.set(this._fixRoutePattern(pattern), handler);
  }

  removeRoute(pattern: string): void {
    this._routeCollection.delete(this._fixRoutePattern(pattern));

    if (!this._routeCollection.size) {
      if (this._mode === 'hash') {
        globalThis.removeEventListener('hashchange', this._handleHashchange);
      } else if (this._mode === 'history') {
        globalThis.removeEventListener('popstate', this._handlePopstate);
      }
    }
  }

  navigate(url: string): void {
    if (this._mode === 'hash') {
      this._navigateWithHashMode(url);
    } else if (this._mode === 'history') {
      this._navigateWithHistoryMode(url);
    }
  }

  private _navigateWithHashMode(url: string): void {
    let newVirtualPath = '';

    if (url.search(/^https?:\/\/|\?|#/i) !== -1) {
      const newUrl = new URL(url, globalThis.location.href);
      const newUrlParts = newUrl.href.split('#');
      const oldUrlParts = globalThis.location.href.split('#');

      if (newUrlParts[0] !== oldUrlParts[0]) {
        globalThis.location.href = newUrl.href;
        return;
      }

      newVirtualPath = newUrlParts[1] ?? '';
    } else {
      newVirtualPath = url;
    }

    const oldVirtualPath = globalThis.location.hash.substring(1);
    const oldVirtualUrl = new URL(oldVirtualPath, globalThis.location.origin);
    const newVirtualUrl = new URL(this._resolveBaseUrl(newVirtualPath), oldVirtualUrl.href);

    if (newVirtualUrl.pathname !== oldVirtualPath) {
      globalThis.location.hash = newVirtualUrl.pathname;
      return;
    }

    this._invokeRouteHandler(newVirtualUrl.pathname);
  }

  private _navigateWithHistoryMode(url: string): void {
    const newUrl = new URL(this._resolveBaseUrl(url), globalThis.location.href);

    if (newUrl.origin !== globalThis.location.origin) {
      globalThis.location.href = newUrl.href;
      return;
    }

    if (newUrl.href !== globalThis.location.href) {
      globalThis.history.pushState({}, '', newUrl.href);
      this._onchange(new CustomEvent('pushstate'));
    }

    this._invokeRouteHandler(newUrl.pathname);
  }

  private _handleHashchange(event: HashChangeEvent): void {
    this._onchange(event);
    this._invokeRouteHandler(globalThis.location.hash.substring(1));
  }

  private _handlePopstate(event: PopStateEvent): void {
    this._onchange(event);
    this._invokeRouteHandler(globalThis.location.pathname);
  }

  private _invokeRouteHandler(path: string): void {
    try {
      if (this._routeCollection.size) {
        for (const [pattern, handler] of this._routeCollection) {
          const matches = path.match(new RegExp(pattern));
          if (matches && matches.groups) {
            handler(matches.groups);
            break;
          }
        }
      }
    } catch (exception) {
      this._onerror(exception);
    }
  }

  private _resolveBaseUrl(url: string): string {
    return (this._base && url.search(/^(https?:\/\/|\/)/i) === -1) ? this._base + url : url;
  }

  private _fixRoutePattern(pattern: string): string {
    // Replace :name to (?<name>[^/?#]+) but don't replace if it's a part of non-capturing groups (?:pattern)
    // The pattern may start with ":" so prefix the pattern with "/" and remove it when the replacement complete
    return `/${pattern}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
  }
}
