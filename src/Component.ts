import type { ComponentContentContainer, NodeStructureContent } from './types.ts';

import CustomElement from './CustomElement.ts';
import ElementAttributesProxy from './ElementAttributesProxy.ts';
import NodeStructure from './NodeStructure.ts';
import dom from './dom.ts';

export default class Component extends CustomElement {
  #attr: ElementAttributesProxy;
  #structure: NodeStructure<ComponentContentContainer>;

  constructor() {
    super();

    this.update = this.update.bind(this);

    this.#attr = new ElementAttributesProxy(this);
    this.#structure = new NodeStructure(this.createContentContainer(), this);
  }

  get attr(): ElementAttributesProxy {
    return this.#attr;
  }

  get structure(): NodeStructure<ComponentContentContainer> {
    return this.#structure;
  }

  get content(): ComponentContentContainer {
    return this.#structure.host;
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
    return this.#structure.host.dispatchEvent(
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
    this.#structure.update(this.template());
  }

  template(): NodeStructureContent {
    return '';
  }
}
