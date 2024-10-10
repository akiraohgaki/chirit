/**
 * A module for handling globalThis across various execution contexts.
 *
 * Main use cases such as server-side rendering and unit testing.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * dom.globalThis = jsdom.window;
 * ```
 */
const dom = {
  globalThis: globalThis,
};

// A workaround for importing mod.ts into non-browser environment.
if (!dom.globalThis.HTMLElement) {
  dom.globalThis = {
    ...dom.globalThis,
    HTMLElement: class HTMLElement {},
  } as typeof globalThis;
}

export default dom;
