import type { ComponentContentContainer, NodeContentData } from './types.ts';

import CustomElement from './CustomElement.ts';
import ElementAttributesProxy from './ElementAttributesProxy.ts';
import NodeContent from './NodeContent.ts';
import dom from './dom.ts';

export default class Component extends CustomElement {
  #attrs: ElementAttributesProxy;
  #content: NodeContent<ComponentContentContainer>;

  constructor() {
    super();

    this.update = this.update.bind(this);

    this.#attrs = new ElementAttributesProxy(this);
    this.#content = new NodeContent(this.createContentContainer(), this);
  }

  get attrs(): ElementAttributesProxy {
    return this.#attrs;
  }

  get content(): NodeContent<ComponentContentContainer> {
    return this.#content;
  }

  observe(...args: Array<unknown>): void {
    if (args.length) {
      for (const arg of args as Array<Record<string, unknown>>) {
        if (arg.subscribe && typeof arg.subscribe === 'function') {
          arg.subscribe(this.update);
        }
      }
    }
  }

  unobserve(...args: Array<unknown>): void {
    if (args.length) {
      for (const arg of args as Array<Record<string, unknown>>) {
        if (arg.unsubscribe && typeof arg.unsubscribe === 'function') {
          arg.unsubscribe(this.update);
        }
      }
    }
  }

  dispatch(type: string, detail?: unknown): boolean {
    return this.#content.container.dispatchEvent(
      new dom.globalThis.CustomEvent(type, {
        detail: detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  createContentContainer(): ComponentContentContainer {
    return this.attachShadow({ mode: 'open' });
  }

  override render(): void {
    this.#content.update(this.template());
  }

  template(): NodeContentData {
    return '';
  }
}
