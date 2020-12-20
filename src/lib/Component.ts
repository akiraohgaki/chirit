import {NodeContentData} from './types.js';
import CustomElement from './CustomElement.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';
import NodeContent from './NodeContent.js';

export default class Component extends CustomElement {

    private _attrs: ElementAttributesProxy;
    private _content: NodeContent<Element | DocumentFragment>;

    constructor() {
        super();

        this._attrs = new ElementAttributesProxy(this);
        this._content = new NodeContent(this.createContentContainer());
    }

    get attrs(): ElementAttributesProxy {
        return this._attrs;
    }

    get content(): NodeContent<Element | DocumentFragment> {
        return this._content;
    }

    dispatch(type: string, detail?: any): boolean {
        return this._content.container.dispatchEvent(new CustomEvent(type, {
            detail: detail,
            bubbles: true,
            composed: true
        }));
    }

    protected createContentContainer(): Element | DocumentFragment {
        return this.attachShadow({mode: 'open'});
    }

    protected render(): void {
        this._content.update(this.template());
    }

    protected template(): NodeContentData {
        return '';
    }

}
