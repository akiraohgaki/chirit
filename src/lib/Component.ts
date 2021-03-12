import type {ComponentContentContainer, NodeContentData} from './types.js';

import CustomElement from './CustomElement.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';
import NodeContent from './NodeContent.js';

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

    dispatch(type: string, detail?: any): boolean {
        return this._content.container.dispatchEvent(new CustomEvent(type, {
            detail: detail,
            bubbles: true,
            composed: true
        }));
    }

    protected createContentContainer(): ComponentContentContainer {
        return this.attachShadow({mode: 'open'});
    }

    protected render(): void {
        this._content.update(this.template());
    }

    protected template(): NodeContentData {
        return '';
    }

}
