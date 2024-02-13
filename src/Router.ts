import type { OnErrorHandler, OnEventHandler, RouteHandler, RouterMode } from './types.ts';

import dom from './dom.ts';

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

    this.#mode = mode;
    // If hash mode, base is part of the path represented by URL fragment
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

  set onchange(handler: OnEventHandler) {
    this.#onchange = handler;
  }

  get onchange(): OnEventHandler {
    return this.#onchange;
  }

  set onerror(handler: OnErrorHandler) {
    this.#onerror = handler;
  }

  get onerror(): OnErrorHandler {
    return this.#onerror;
  }

  set(pattern: string, handler: RouteHandler): void {
    if (!this.#routeCollection.size) {
      if (this.#mode === 'hash') {
        dom.globalThis.addEventListener('hashchange', this.#hashchangeCallback);
      } else if (this.#mode === 'history') {
        dom.globalThis.addEventListener('popstate', this.#popstateCallback);
      }
    }

    this.#routeCollection.set(this.#fixRoutePattern(pattern), handler);
  }

  delete(pattern: string): void {
    this.#routeCollection.delete(this.#fixRoutePattern(pattern));

    if (!this.#routeCollection.size) {
      if (this.#mode === 'hash') {
        dom.globalThis.removeEventListener('hashchange', this.#hashchangeCallback);
      } else if (this.#mode === 'history') {
        dom.globalThis.removeEventListener('popstate', this.#popstateCallback);
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

    if (url.search(/^[A-Za-z0-9\+\-\.]+:\/\/|\?|#/) !== -1) {
      const newUrl = new dom.globalThis.URL(url, dom.globalThis.location.href);
      const newUrlParts = newUrl.href.split('#');
      const oldUrlParts = dom.globalThis.location.href.split('#');

      if (newUrlParts[0] !== oldUrlParts[0]) {
        dom.globalThis.location.href = newUrl.href;
        return;
      }

      newVirtualPath = newUrlParts[1] ?? '';
    } else {
      newVirtualPath = url;
    }

    const oldVirtualPath = dom.globalThis.location.hash.substring(1);
    const oldVirtualUrl = new dom.globalThis.URL(oldVirtualPath, dom.globalThis.location.origin);
    const newVirtualUrl = new dom.globalThis.URL(this.#resolveBaseUrl(newVirtualPath), oldVirtualUrl.href);

    if (newVirtualUrl.pathname !== oldVirtualPath) {
      dom.globalThis.location.hash = newVirtualUrl.pathname;
      // hashchange event is fired
      return;
    }

    // Just invoke route handler if no URL changed
    this.#invokeRouteHandler(newVirtualUrl.pathname);
  }

  #navigateWithHistoryMode(url: string): void {
    const newUrl = new dom.globalThis.URL(this.#resolveBaseUrl(url), dom.globalThis.location.href);

    if (newUrl.origin !== dom.globalThis.location.origin) {
      dom.globalThis.location.href = newUrl.href;
      return;
    }

    // Changes URL state and invoke route handler
    if (newUrl.href !== dom.globalThis.location.href) {
      dom.globalThis.history.pushState({}, '', newUrl.href);
      this.#onchange(new dom.globalThis.CustomEvent('pushstate'));
    }

    this.#invokeRouteHandler(newUrl.pathname);
  }

  #handleHashchange(event: HashChangeEvent): void {
    this.#onchange(event);
    this.#invokeRouteHandler(dom.globalThis.location.hash.substring(1));
  }

  #handlePopstate(event: PopStateEvent): void {
    this.#onchange(event);
    this.#invokeRouteHandler(dom.globalThis.location.pathname);
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
    return (this.#base && url.search(/^([A-Za-z0-9\+\-\.]+:\/\/|\/)/) === -1) ? this.#base + url : url;
  }

  #fixRoutePattern(pattern: string): string {
    // Replace :name to (?<name>[^/?#]+) but don't replace if it's a part of non-capturing groups (?:pattern)
    // The pattern may start with ":" so prefix the pattern with "/" and remove it when the replacement complete
    return `/${pattern}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
  }
}
