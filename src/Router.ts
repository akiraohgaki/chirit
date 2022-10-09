import type { OnErrorHandler, OnEventHandler, RouteHandler, RouterMode } from './types.ts';

import util from './util.ts';

export default class Router {
  #mode: RouterMode;
  #base: string;
  #onchange: OnEventHandler;
  #onerror: OnErrorHandler;

  #routeCollection: Map<string, RouteHandler>;
  #hashchangeCallback: { (event: HashChangeEvent): void };
  #popstateCallback: { (event: PopStateEvent): void };

  constructor(mode: RouterMode, base: string = '') {
    if (mode !== 'hash' && mode !== 'history') {
      throw new Error('The mode must be set "hash" or "history".');
    }

    // If the mode is 'hash',
    // the base should be the base path part of the path represented with URL fragment
    this.#mode = mode;
    this.#base = (base && !base.endsWith('/')) ? base + '/' : base;
    this.#onchange = () => {};
    this.#onerror = (exception) => {
      console.error(exception);
    };

    this.#routeCollection = new Map();
    this.#hashchangeCallback = this.#handleHashchange.bind(this);
    this.#popstateCallback = this.#handlePopstate.bind(this);
  }

  get mode(): RouterMode {
    return this.#mode;
  }

  get base(): string {
    return this.#base;
  }

  // deno-lint-ignore explicit-module-boundary-types
  set onchange(handler: OnEventHandler) {
    this.#onchange = handler;
  }

  get onchange(): OnEventHandler {
    return this.#onchange;
  }

  // deno-lint-ignore explicit-module-boundary-types
  set onerror(handler: OnErrorHandler) {
    this.#onerror = handler;
  }

  get onerror(): OnErrorHandler {
    return this.#onerror;
  }

  set(pattern: string, handler: RouteHandler): void {
    if (!this.#routeCollection.size) {
      if (this.#mode === 'hash') {
        util.globalThis.addEventListener('hashchange', this.#hashchangeCallback);
      } else if (this.#mode === 'history') {
        util.globalThis.addEventListener('popstate', this.#popstateCallback);
      }
    }

    this.#routeCollection.set(this.#fixRoutePattern(pattern), handler);
  }

  delete(pattern: string): void {
    this.#routeCollection.delete(this.#fixRoutePattern(pattern));

    if (!this.#routeCollection.size) {
      if (this.#mode === 'hash') {
        util.globalThis.removeEventListener('hashchange', this.#hashchangeCallback);
      } else if (this.#mode === 'history') {
        util.globalThis.removeEventListener('popstate', this.#popstateCallback);
      }
    }
  }

  navigate(url: string): void {
    if (this.#mode === 'hash') {
      this.#navigateWithHashMode(url);
    } else if (this.#mode === 'history') {
      this.#navigateWithHistoryMode(url);
    }
  }

  #navigateWithHashMode(url: string): void {
    let newVirtualPath = '';

    if (url.search(/^https?:\/\/|\?|#/i) !== -1) {
      const newUrl = new util.globalThis.URL(url, util.globalThis.location.href);
      const newUrlParts = newUrl.href.split('#');
      const oldUrlParts = util.globalThis.location.href.split('#');

      if (newUrlParts[0] !== oldUrlParts[0]) {
        util.globalThis.location.href = newUrl.href;
        return;
      }

      newVirtualPath = newUrlParts[1] ?? '';
    } else {
      newVirtualPath = url;
    }

    const oldVirtualPath = util.globalThis.location.hash.substring(1);
    const oldVirtualUrl = new util.globalThis.URL(oldVirtualPath, util.globalThis.location.origin);
    const newVirtualUrl = new util.globalThis.URL(this.#resolveBaseUrl(newVirtualPath), oldVirtualUrl.href);

    if (newVirtualUrl.pathname !== oldVirtualPath) {
      util.globalThis.location.hash = newVirtualUrl.pathname;
      // Then hashchange event will fire
      return;
    }

    // Just invoke route handler if no URL changed
    this.#invokeRouteHandler(newVirtualUrl.pathname);
  }

  #navigateWithHistoryMode(url: string): void {
    const newUrl = new util.globalThis.URL(this.#resolveBaseUrl(url), util.globalThis.location.href);

    if (newUrl.origin !== util.globalThis.location.origin) {
      util.globalThis.location.href = newUrl.href;
      return;
    }

    // Changes URL state and invoke route handler
    if (newUrl.href !== util.globalThis.location.href) {
      util.globalThis.history.pushState({}, '', newUrl.href);
      this.#onchange(new util.globalThis.CustomEvent('pushstate'));
    }

    this.#invokeRouteHandler(newUrl.pathname);
  }

  #handleHashchange(event: HashChangeEvent): void {
    this.#onchange(event);
    this.#invokeRouteHandler(util.globalThis.location.hash.substring(1));
  }

  #handlePopstate(event: PopStateEvent): void {
    this.#onchange(event);
    this.#invokeRouteHandler(util.globalThis.location.pathname);
  }

  #invokeRouteHandler(path: string): void {
    try {
      if (this.#routeCollection.size) {
        for (const [pattern, handler] of this.#routeCollection) {
          const matches = path.match(new RegExp(pattern));
          if (matches) {
            handler(matches.groups ?? {});
            break;
          }
        }
      }
    } catch (exception) {
      this.#onerror(exception);
    }
  }

  #resolveBaseUrl(url: string): string {
    return (this.#base && url.search(/^(https?:\/\/|\/)/i) === -1) ? this.#base + url : url;
  }

  #fixRoutePattern(pattern: string): string {
    // Replace :name to (?<name>[^/?#]+) but don't replace if it's a part of non-capturing groups (?:pattern)
    // The pattern may start with ":" so prefix the pattern with "/" and remove it when the replacement complete
    return `/${pattern}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
  }
}
