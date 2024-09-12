import type { NodeStructureContent, OnEventHandler } from './types.ts';

import dom from './dom.ts';

const hostCollection = new WeakSet();

/**
 * Manages the structure of DOM nodes.
 *
 * This class manages the lifecycle of associated DOM nodes and contexts to simplify DOM manipulation.
 *
 * ----
 *
 * @example Update the content of the host node
 * ```ts
 * const host = document.createElement('div');
 * const context = { eventHandler: (event: Event) => console.log(event) };
 *
 * const nodeStructure = new NodeStructure(host, context);
 *
 * nodeStructure.update(`
 *   <h1>Hello</h1>
 * `);
 * // HTML
 * // <div>
 * // <h1>Hello</h1>
 * // </div>
 *
 * nodeStructure.update(`
 *   <h1>Hello</h1>
 *   <button onclick="this.eventHandler(event)">Click me</button>
 * `);
 * // HTML
 * // <div>
 * // <h1>Hello</h1>
 * // <button>Click me</button>
 * // </div>
 * ```
 *
 * @template T - The type of the host node (e.g., HTMLElement).
 */
export default class NodeStructure<T extends Node> {
  #hostRef: WeakRef<T> | null;
  #contextRef: WeakRef<Record<string, unknown>> | null;

  /**
   * Creates a new instance of the NodeStructure class.
   *
   * @param host - The host node to manage.
   * @param context - The context object associated with the structure.
   */
  constructor(host: T, context?: unknown) {
    // Avoid affect child nodes managed by this feature.
    hostCollection.add(host);

    // Avoid circular references to make GC easier.
    this.#hostRef = new WeakRef(host);
    this.#contextRef = context ? new WeakRef(context as Record<string, unknown>) : null;
  }

  /**
   * Returns the host node.
   *
   * @throws {Error} - If the host node is not available.
   */
  get host(): T {
    return this.#getHost();
  }

  /**
   * Updates the content of the host node.
   *
   * @param content - The new content to update the host node with.
   *
   * @throws {Error} - If the host node is not available.
   */
  update(content: NodeStructureContent): void {
    const host = this.#getHost();

    if (content instanceof dom.globalThis.Document || content instanceof dom.globalThis.DocumentFragment) {
      this.#patchNodesInsideOf(host, content);
    } else {
      this.#patchNodesInsideOf(host, this.#createDocumentFragment(content));
    }

    this.#fixOneventHandlersInsideOf(host);
  }

  /**
   * Creates a deep clone of the content of the host node.
   *
   * @throws {Error} - If the host node is not available.
   */
  clone(): DocumentFragment {
    const host = this.#getHost();

    return this.#createDocumentFragment(host.childNodes);
  }

  #getHost(): T {
    if (this.#hostRef) {
      const host = this.#hostRef.deref();
      if (host) {
        return host;
      } else {
        this.#hostRef = null;
      }
    }
    throw new Error('The host node is not available.');
  }

  #getContext(): unknown {
    if (this.#contextRef) {
      const context = this.#contextRef.deref();
      if (context) {
        return context;
      } else {
        this.#contextRef = null;
      }
    }
    return undefined;
  }

  #createDocumentFragment(content: NodeStructureContent): DocumentFragment {
    if (typeof content === 'string') {
      // !DOCTYPE, HTML, HEAD, BODY will stripped inside HTMLTemplateElement.
      const template = dom.globalThis.document.createElement('template');
      template.innerHTML = content;
      return template.content;
    }

    // Some node types like DocumentType will not insert into DocumentFragment.
    // ShadowRoot will not cloneable also not included in NodeList.
    const documentFragment = dom.globalThis.document.createDocumentFragment();
    if (content instanceof dom.globalThis.Node) {
      documentFragment.appendChild(content.cloneNode(true));
    } else if (content instanceof dom.globalThis.NodeList && content.length) {
      for (const node of Array.from(content)) {
        documentFragment.appendChild(node.cloneNode(true));
      }
    }
    return documentFragment;
  }

  #patchNodesInsideOf(original: Node, diff: Node): void {
    if (original.hasChildNodes() || diff.hasChildNodes()) {
      // NodeList of Node.childNodes is live so must be convert to array.
      const originalChildNodes = Array.from(original.childNodes);
      const diffChildNodes = Array.from(diff.childNodes);
      const maxLength = Math.max(originalChildNodes.length, diffChildNodes.length);

      for (let i = 0; i < maxLength; i++) {
        this.#patchNodes(
          original,
          originalChildNodes[i] ?? null,
          diffChildNodes[i] ?? null,
        );
      }
    }
  }

  #patchNodes(parent: Node, original: Node | null, diff: Node | null): void {
    if (original && !diff) {
      parent.removeChild(original);
    } else if (!original && diff) {
      parent.appendChild(diff.cloneNode(true));
    } else if (original && diff) {
      if (original.nodeType === diff.nodeType && original.nodeName === diff.nodeName) {
        if (original instanceof dom.globalThis.Element && diff instanceof dom.globalThis.Element) {
          // Element it's HTMLElement, SVGElement.
          this.#patchAttributes(original, diff);
          if (!hostCollection.has(original)) {
            this.#patchNodesInsideOf(original, diff);
          }
        } else if (original instanceof dom.globalThis.CharacterData && diff instanceof dom.globalThis.CharacterData) {
          // CharacterData it's Text, Comment, ProcessingInstruction.
          if (original.nodeValue !== diff.nodeValue) {
            original.nodeValue = diff.nodeValue;
          }
        } else {
          parent.replaceChild(diff.cloneNode(true), original);
        }
      } else {
        parent.replaceChild(diff.cloneNode(true), original);
      }
    }
  }

  #patchAttributes(original: Element, diff: Element): void {
    // NamedNodeMap of Element.attributes is live so must be convert to array.
    if (original.hasAttributes()) {
      for (const attribute of Array.from(original.attributes)) {
        if (!diff.hasAttribute(attribute.name)) {
          original.removeAttribute(attribute.name);
        }
      }
    }

    if (diff.hasAttributes()) {
      for (const attribute of Array.from(diff.attributes)) {
        if (
          !original.hasAttribute(attribute.name) ||
          original.getAttribute(attribute.name) !== attribute.value
        ) {
          original.setAttribute(attribute.name, attribute.value);
        }
      }
    }
  }

  #fixOneventHandlersInsideOf(target: Node): void {
    if (target.hasChildNodes()) {
      for (const node of Array.from(target.childNodes)) {
        if (node instanceof dom.globalThis.Element) {
          this.#fixOneventHandlers(node);
        }
      }
    }
  }

  #fixOneventHandlers(target: Element): void {
    if (target.hasAttributes()) {
      // NamedNodeMap of Element.attributes is live so must be convert to array.
      for (const attribute of Array.from(target.attributes)) {
        if (attribute.name.search(/^on\w+/i) !== -1) {
          const onevent = attribute.name.toLowerCase();
          const oneventTarget = target as unknown as Record<string, OnEventHandler>;
          if (onevent in target && typeof oneventTarget[onevent] === 'function') {
            const handler = new Function('event', attribute.value);
            const context = this.#getContext();
            target.removeAttribute(attribute.name);
            oneventTarget[onevent] = handler.bind(context ?? target);
          }
        }
      }
    }

    if (!hostCollection.has(target)) {
      this.#fixOneventHandlersInsideOf(target);
    }
  }
}