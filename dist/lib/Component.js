import CustomElement from './CustomElement.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';
import NodeContent from './NodeContent.js';
export default class Component extends CustomElement {
    constructor() {
        super();
        this._attrs = new ElementAttributesProxy(this);
        this._content = new NodeContent(this.createContentContainer());
    }
    get attrs() {
        return this._attrs;
    }
    get content() {
        return this._content;
    }
    dispatch(type, detail) {
        return this._content.container.dispatchEvent(new CustomEvent(type, {
            detail: detail,
            bubbles: true,
            composed: true
        }));
    }
    createContentContainer() {
        return this.attachShadow({ mode: 'open' });
    }
    render() {
        this._content.update(this.template());
    }
    template() {
        return '';
    }
}
//# sourceMappingURL=Component.js.map