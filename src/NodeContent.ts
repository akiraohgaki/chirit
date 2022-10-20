import type { NodeContentData, OnEventHandler } from './types.ts';

import dom from './dom.ts';

const containerCollection = new WeakSet();

export default class NodeContent<T extends Node> {
  #container: T;

  #context: unknown;

  constructor(container: T, context?: unknown) {
    containerCollection.add(container);

    //this.#containerRef = new WeakRef(container);
    this.#container = container;

    //this.#contextRef = new WeakRef(context);
    this.#context = context;
  }

  get container(): T {
    return this.#container;
  }

  update(content: NodeContentData): void {
    if (content instanceof dom.globalThis.Document || content instanceof dom.globalThis.DocumentFragment) {
      this.#patchNodesInsideOf(this.#container, content);
    } else {
      this.#patchNodesInsideOf(this.#container, this.#createDocumentFragment(content));
    }

    this.#fixOneventHandlersInsideOf(this.#container);
  }

  clone(): DocumentFragment {
    return this.#createDocumentFragment(this.#container.childNodes);
  }

  #createDocumentFragment(content: NodeContentData): DocumentFragment {
    if (typeof content === 'string') {
      // !DOCTYPE, HTML, HEAD, BODY will stripped inside HTMLTemplateElement
      const template = dom.globalThis.document.createElement('template');
      template.innerHTML = content;
      return template.content;
    }

    // Some node types like DocumentType will not insert into DocumentFragment
    // ShadowRoot will not cloneable also not included in NodeList
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
      // NodeList of Node.childNodes is live so must be convert to array
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
          // Element it's HTMLElement, SVGElement
          this.#patchAttributes(original, diff);
          if (!containerCollection.has(original)) {
            this.#patchNodesInsideOf(original, diff);
          }
        } else if (original instanceof dom.globalThis.CharacterData && diff instanceof dom.globalThis.CharacterData) {
          // CharacterData it's Text, Comment, ProcessingInstruction
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
    // NamedNodeMap of Element.attributes is live so must be convert to array
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
      // NamedNodeMap of Element.attributes is live so must be convert to array
      for (const attribute of Array.from(target.attributes)) {
        if (attribute.name.search(/^on\w+/i) !== -1) {
          const onevent = attribute.name.toLowerCase();
          const oneventTarget = target as unknown as Record<string, OnEventHandler>;
          if (onevent in target && typeof oneventTarget[onevent] === 'function') {
            const handler = new Function('event', attribute.value);
            target.removeAttribute(attribute.name);
            oneventTarget[onevent] = handler.bind(this.#context ?? target);
          }
        }
      }
    }

    if (!containerCollection.has(target)) {
      this.#fixOneventHandlersInsideOf(target);
    }
  }
}
