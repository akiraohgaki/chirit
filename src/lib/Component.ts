import type { ComponentContentContainer, NodeContentData } from './types.ts';

import CustomElement from './CustomElement.ts';
import ElementAttributesProxy from './ElementAttributesProxy.ts';
import NodeContent from './NodeContent.ts';

export default class Component extends CustomElement {
  private _attrs: ElementAttributesProxy;
  private _content: NodeContent<ComponentContentContainer>;

  constructor() {
    super();

    this._attrs = new ElementAttributesProxy(this);
    this._content = new NodeContent(this.createContentContainer(), this);
  }

  get attrs(): ElementAttributesProxy {
    return this._attrs;
  }

  get content(): NodeContent<ComponentContentContainer> {
    return this._content;
  }

  dispatch(type: string, detail?: unknown): boolean {
    return this._content.container.dispatchEvent(
      new CustomEvent(type, {
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
    this._content.update(this.template());
  }

  protected template(): NodeContentData {
    return '';
  }
}
