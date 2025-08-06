import { dom } from './dom.ts';

const hostCollection = new WeakSet();

/**
 * Manages the structure of DOM nodes.
 *
 * It simplifies DOM manipulation by managing the lifecycle of linked DOM nodes and contexts.
 * And DOM updates are optimized through a diffing process.
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
 * @example Adopt the styles to the host node
 * ```ts
 * const element = document.querySelector('custom-element');
 *
 * const nodeStructure = new NodeStructure(element.shadowRoot);
 *
 * nodeStructure.adoptStyles([
 *   ...document.adoptedStyleSheets,
 *   `:host { diaplay: inline-block; }`
 * ]);
 * ```
 *
 * @template T - The type of the host node (e.g., HTMLElement).
 */
export class NodeStructure<T extends Node> {
  #hostRef: WeakRef<T> | null;

  #contextRef: WeakRef<Record<string, unknown>> | null;

  #oneventCollection: Set<[Element, string]>;

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

    // Manage onevent handlers.
    this.#oneventCollection = new Set();
  }

  /**
   * The host node.
   *
   * @throws {Error} - If the host node is not available.
   */
  get host(): T {
    return this.#getHost();
  }

  /**
   * Adopts styles to the host node.
   *
   * This method works only if the host node is a Document or ShadowRoot.
   *
   * @param styles - The styles to adopt to the host node.
   *
   * @throws {Error} - If the host node is not available.
   */
  adoptStyles(styles: string | CSSStyleSheet | Array<string | CSSStyleSheet>): void {
    const host = this.#getHost();

    if (host instanceof dom.globalThis.Document || host instanceof dom.globalThis.ShadowRoot) {
      const sheets: Array<CSSStyleSheet> = [];
      const entries = Array.isArray(styles) ? styles : [styles];

      for (const entry of entries) {
        if (entry instanceof dom.globalThis.CSSStyleSheet) {
          sheets.push(entry);
        } else if (typeof entry === 'string') {
          const sheet = new dom.globalThis.CSSStyleSheet();
          sheet.replaceSync(entry);
          sheets.push(sheet);
        }
      }

      if (sheets.length) {
        host.adoptedStyleSheets = sheets;
      }
    } else {
      console.warn('The styles cannot be adopted because the host node is not a "Document" or "ShadowRoot".');
    }
  }

  /**
   * Updates the content of the host node.
   *
   * @param content - The new content to update the host node with.
   *
   * @throws {Error} - If the host node is not available.
   */
  update(content: string | Node | NodeList): void {
    const host = this.#getHost();

    this.#clearOneventHandlers();

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

  /**
   * Gets the host node.
   *
   * @throws {Error} - If the host node is not available.
   */
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

  /**
   * Gets the context object.
   *
   * @returns The context object, or undefined if it is not available.
   */
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

  /**
   * Creates document fragment.
   *
   * @param content - The content into the document fragment.
   */
  #createDocumentFragment(content: string | Node | NodeList): DocumentFragment {
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

  /**
   * Patch the nodes inside of the original node.
   *
   * @param original - The original node.
   * @param diff - The diff node.
   */
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

  /**
   * Patch the nodes.
   *
   * @param parent - The parent node.
   * @param original - The original node.
   * @param diff - The diff node.
   */
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

  /**
   * Patch the attributes of the element.
   *
   * @param original - The original element.
   * @param diff - The diff element.
   */
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

  /**
   * Fix the onevent handlers inside of the target node.
   *
   * @param target - The target node.
   */
  #fixOneventHandlersInsideOf(target: Node): void {
    if (target.hasChildNodes()) {
      for (const node of Array.from(target.childNodes)) {
        if (node instanceof dom.globalThis.Element) {
          this.#fixOneventHandlers(node);
        }
      }
    }
  }

  /**
   * Fix the onevent handlers of the target element.
   *
   * @param target - The target element.
   */
  #fixOneventHandlers(target: Element): void {
    if (target.hasAttributes()) {
      // NamedNodeMap of Element.attributes is live so must be convert to array.
      for (const attribute of Array.from(target.attributes)) {
        if (attribute.name.search(/^on\w+/i) !== -1) {
          const onevent = attribute.name.toLowerCase();
          const oneventTarget = target as unknown as Record<string, (event: Event) => unknown>;

          if (onevent in target && typeof oneventTarget[onevent] === 'function') {
            const handler = new Function('event', attribute.value);
            const context = this.#getContext();

            target.removeAttribute(attribute.name);
            oneventTarget[onevent] = handler.bind(context ?? target);

            this.#oneventCollection.add([target, onevent]);
          }
        }
      }
    }

    if (!hostCollection.has(target)) {
      this.#fixOneventHandlersInsideOf(target);
    }
  }

  /**
   * Clears the onevent handlers.
   */
  #clearOneventHandlers(): void {
    for (const [target, onevent] of this.#oneventCollection) {
      const oneventTarget = target as unknown as Record<string, null>;
      oneventTarget[onevent] = null;
    }

    this.#oneventCollection.clear();
  }
}
