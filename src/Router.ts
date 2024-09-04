import type { OnErrorHandler, OnEventHandler, RouteHandler, RouterMode } from './types.ts';

import dom from './dom.ts';

/**
 * A client-side router for front-end application.
 *
 * This class manages routes and handle navigation events within an application.
 * It supports both hash-based routing and history-based routing modes.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const router = new Router('hash');
 *
 * router.set('^/$', () => {
 *   console.log('Home Page');
 *   // ...
 * });
 * router.set('/users/:name', (params) => {
 *   console.log(`User Page for ${params.name}`);
 *   // ...
 * });
 * router.set('.*', () => {
 *   console.log('Not Found Page');
 *   // ...
 * });
 *
 * router.onchange = (event) => {
 *   console.log('Route changed:', event);
 * };
 * router.onerror = (error) => {
 *   console.error('Error occurred:', error);
 * };
 *
 * router.navigate(location.href);
 * ```
 */
export default class Router {
  #mode: RouterMode;
  #base: string;
  #onchange: OnEventHandler;
  #onerror: OnErrorHandler;

  #routeCollection: Map<string, RouteHandler>;
  #hashchangeCallback: { (event: HashChangeEvent): void };
  #popstateCallback: { (event: PopStateEvent): void };

  /**
   * Creates a new instance of the Router class.
   *
   * @param mode - The routing mode to use (`hash` or `history`).
   * @param base - The base path for all routes.
   *
   * @throws {Error} - If the provided mode is not `hash` or `history`.
   */
  constructor(mode: RouterMode, base: string = '') {
    if (mode !== 'hash' && mode !== 'history') {
      throw new Error('The routing mode must be set to "hash" or "history".');
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

  /**
   * Returns the current routing mode.
   */
  get mode(): RouterMode {
    return this.#mode;
  }

  /**
   * Returns the current base path.
   */
  get base(): string {
    return this.#base;
  }

  /**
   * The function to be called when the route changes.
   */
  set onchange(handler: OnEventHandler) {
    this.#onchange = handler;
  }

  /**
   * The function to be called when the route changes.
   */
  get onchange(): OnEventHandler {
    return this.#onchange;
  }

  /**
   * The function to be called when an error occurs.
   */
  set onerror(handler: OnErrorHandler) {
    this.#onerror = handler;
  }

  /**
   * The function to be called when an error occurs.
   */
  get onerror(): OnErrorHandler {
    return this.#onerror;
  }

  /**
   * Registers a route pattern and its handler function.
   *
   * @param pattern - The route pattern with named parameters.
   * @param handler - The function to be called when the route is matched.
   */
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

  /**
   * Removes a route pattern.
   *
   * @param pattern - The route pattern to remove.
   */
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

  /**
   * Navigates to a new URL.
   *
   * @param url - The URL to navigate to.
   */
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
