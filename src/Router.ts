import { dom } from './dom.ts';

/**
 * A client-side router that manages routes and handle navigation events within an application.
 *
 * It supports both hash-based routing and history-based routing modes.
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
 *   console.log('URL state has changed.', event);
 * };
 * router.onerror = (exception) => {
 *   console.error('An error occurred while routing.', exception);
 * };
 *
 * router.navigate(location.href);
 * ```
 */
export class Router {
  #mode: 'hash' | 'history';

  #base: string;

  #onchange: (event: Event) => unknown;

  #onerror: (exception: unknown) => unknown;

  #routeCollection: Map<string, (params: Record<string, string>) => unknown>;

  #_hashchangeCallback: (event: HashChangeEvent) => void;

  #_popstateCallback: (event: PopStateEvent) => void;

  /**
   * Creates a new instance of the Router class.
   *
   * @param mode - The routing mode to use (hash or history).
   * @param base - The base path for all routes.
   *
   * @throws {Error} - If the provided mode is not hash or history.
   */
  constructor(mode: 'hash' | 'history', base: string = '') {
    if (mode !== 'hash' && mode !== 'history') {
      throw new Error('The routing mode must be set to "hash" or "history".');
    }

    this.#mode = mode;
    // If hash mode, base path is a part of the path represented by URL fragment.
    this.#base = (base && !base.endsWith('/')) ? base + '/' : base;
    this.#onchange = () => {};
    this.#onerror = (exception) => {
      console.error(exception);
    };

    this.#routeCollection = new Map();
    this.#_hashchangeCallback = this.#hashchangeCallback.bind(this);
    this.#_popstateCallback = this.#popstateCallback.bind(this);
  }

  /**
   * The routing mode.
   */
  get mode(): 'hash' | 'history' {
    return this.#mode;
  }

  /**
   * The base path.
   */
  get base(): string {
    return this.#base;
  }

  /**
   * The number of route patterns in the collection.
   */
  get size(): number {
    return this.#routeCollection.size;
  }

  /**
   * The function invoked when the route changed.
   *
   * @param event - The event that fire when URL state has changed.
   */
  set onchange(handler: (event: Event) => unknown) {
    this.#onchange = handler;
  }

  /**
   * The function invoked when the route changed.
   *
   * @param event - The event that fire when URL state has changed.
   */
  get onchange(): (event: Event) => unknown {
    return this.#onchange;
  }

  /**
   * The function invoked when an error occurred.
   *
   * @param exception - The error that occurred.
   */
  set onerror(handler: (exception: unknown) => unknown) {
    this.#onerror = handler;
  }

  /**
   * The function invoked when an error occurred.
   *
   * @param exception - The error that occurred.
   */
  get onerror(): (exception: unknown) => unknown {
    return this.#onerror;
  }

  /**
   * Registers a route pattern and its handler function.
   *
   * @param pattern - The route pattern with named parameters.
   * @param handler - The function invoked when a route matched.
   */
  set(pattern: string, handler: (params: Record<string, string>) => unknown): void {
    if (!this.#routeCollection.size) {
      if (this.#mode === 'hash') {
        dom.globalThis.addEventListener('hashchange', this.#_hashchangeCallback);
      } else if (this.#mode === 'history') {
        dom.globalThis.addEventListener('popstate', this.#_popstateCallback);
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
        dom.globalThis.removeEventListener('hashchange', this.#_hashchangeCallback);
      } else if (this.#mode === 'history') {
        dom.globalThis.removeEventListener('popstate', this.#_popstateCallback);
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

  /**
   * Navigates to a new URL with hash mode.
   *
   * @param url - The URL to navigate to.
   */
  #navigateWithHashMode(url: string): void {
    let newVirtualPath = '';

    if (url.search(/^[A-Za-z0-9\+\-\.]+:\/\/|\?|#/) !== -1) {
      const newUrl = new URL(url, dom.globalThis.location.href);
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
    const oldVirtualUrl = new URL(oldVirtualPath, dom.globalThis.location.origin);
    const newVirtualUrl = new URL(this.#resolveBaseUrl(newVirtualPath), oldVirtualUrl.href);

    if (newVirtualUrl.pathname !== oldVirtualPath) {
      dom.globalThis.location.hash = newVirtualUrl.pathname;
      // hashchange event will fired.
      return;
    }

    // Just invoke route handler if no URL changed.
    this.#invokeRouteHandler(newVirtualUrl.pathname);
  }

  /**
   * Navigates to a new URL with history mode.
   *
   * @param url - The URL to navigate to.
   */
  #navigateWithHistoryMode(url: string): void {
    const newUrl = new URL(this.#resolveBaseUrl(url), dom.globalThis.location.href);

    if (newUrl.origin !== dom.globalThis.location.origin) {
      dom.globalThis.location.href = newUrl.href;
      return;
    }

    // Changes URL state and invoke route handler.
    if (newUrl.href !== dom.globalThis.location.href) {
      dom.globalThis.history.pushState({}, '', newUrl.href);
      this.#onchange(new dom.globalThis.CustomEvent('pushstate'));
    }

    this.#invokeRouteHandler(newUrl.pathname);
  }

  /**
   * Callback invoked when hashchange event fired.
   *
   * @param event - The hashchange event object.
   */
  #hashchangeCallback(event: HashChangeEvent): void {
    this.#onchange(event);
    this.#invokeRouteHandler(dom.globalThis.location.hash.substring(1));
  }

  /**
   * Callback invoked when popstate event fired.
   *
   * @param event - The popstate event object.
   */
  #popstateCallback(event: PopStateEvent): void {
    this.#onchange(event);
    this.#invokeRouteHandler(dom.globalThis.location.pathname);
  }

  /**
   * Invokes the route handler.
   *
   * @param path - The path to invoke the route handler for.
   */
  #invokeRouteHandler(path: string): void {
    try {
      for (const [pattern, handler] of this.#routeCollection) {
        const matches = path.match(new RegExp(pattern));
        if (matches) {
          handler(matches.groups ?? {});
          break;
        }
      }
    } catch (exception) {
      this.#onerror(exception);
    }
  }

  /**
   * Resolves the base URL.
   *
   * @param url - The URL to resolve the base for.
   */
  #resolveBaseUrl(url: string): string {
    return (this.#base && url.search(/^([A-Za-z0-9\+\-\.]+:\/\/|\/)/) === -1) ? this.#base + url : url;
  }

  /**
   * Fixes the route pattern.
   *
   * @param pattern - The route pattern to fix.
   */
  #fixRoutePattern(pattern: string): string {
    // Replace :name to (?<name>[^/?#]+) but don't replace if it's a part of non-capturing groups (?:pattern).
    // And the pattern may start with ':' so prefix the pattern with '/' and remove it when the replacement complete.
    return `/${pattern}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
  }
}
