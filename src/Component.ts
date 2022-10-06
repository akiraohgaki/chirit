import type { ComponentContentContainer, NodeContentData } from './types.ts';

import CustomElement from './CustomElement.ts';
import ElementAttributesProxy from './ElementAttributesProxy.ts';
import NodeContent from './NodeContent.ts';
import util from './util.ts';

const $globalThis = util.globalThis();

export default class Component extends CustomElement {
  #attrs: ElementAttributesProxy;
  #content: NodeContent<ComponentContentContainer>;

  constructor() {
    super();

    this.#attrs = new ElementAttributesProxy(this);
    this.#content = new NodeContent(this.createContentContainer(), this);
  }

  get attrs(): ElementAttributesProxy {
    return this.#attrs;
  }

  get content(): NodeContent<ComponentContentContainer> {
    return this.#content;
  }

  dispatch(type: string, detail?: unknown): boolean {
    return this.#content.container.dispatchEvent(
      new $globalThis.CustomEvent(type, {
        detail: detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected createContentContainer(): ComponentContentContainer {
    return this.attachShadow({ mode: 'open' });
  }

  protected override render(): void {
    this.#content.update(this.template());
  }

  protected template(): NodeContentData {
    return '';
  }
}
