export default class NodeContent {
    constructor(container) {
        this._container = container;
    }
    get container() {
        return this._container;
    }
    update(content) {
        if (content instanceof Document || content instanceof DocumentFragment) {
            this._updateChildNodes(this._container, content);
        }
        else {
            this._updateChildNodes(this._container, this._createDocumentFragment(content));
        }
    }
    get() {
        return this._createDocumentFragment(this._container.childNodes);
    }
    _createDocumentFragment(content) {
        if (typeof content === 'string') {
            const template = document.createElement('template');
            template.innerHTML = content;
            return template.content;
        }
        const documentFragment = document.createDocumentFragment();
        if (content instanceof Node) {
            documentFragment.appendChild(content.cloneNode(true));
        }
        else if (content instanceof NodeList) {
            for (let i = 0; i < content.length; i++) {
                documentFragment.appendChild(content[i].cloneNode(true));
            }
        }
        return documentFragment;
    }
    _updateChildNodes(oldParent, newParent) {
        var _a, _b;
        const oldChildNodes = Array.from(oldParent.childNodes);
        const newChildNodes = Array.from(newParent.childNodes);
        const maxLength = Math.max(oldChildNodes.length, newChildNodes.length);
        for (let i = 0; i < maxLength; i++) {
            this._updateChildNode(oldParent, (_a = oldChildNodes[i]) !== null && _a !== void 0 ? _a : null, (_b = newChildNodes[i]) !== null && _b !== void 0 ? _b : null);
        }
    }
    _updateChildNode(parent, oldChild, newChild) {
        if (oldChild && !newChild) {
            parent.removeChild(oldChild);
        }
        else if (!oldChild && newChild) {
            parent.appendChild(newChild.cloneNode(true));
        }
        else if (oldChild && newChild) {
            if (oldChild.nodeType === newChild.nodeType
                && oldChild.nodeName === newChild.nodeName) {
                if (oldChild instanceof Element && newChild instanceof Element) {
                    this._updateAttributes(oldChild, newChild);
                    this._updateChildNodes(oldChild, newChild);
                }
                else if (oldChild instanceof CharacterData && newChild instanceof CharacterData) {
                    if (oldChild.nodeValue !== newChild.nodeValue) {
                        oldChild.nodeValue = newChild.nodeValue;
                    }
                }
                else {
                    parent.replaceChild(newChild.cloneNode(true), oldChild);
                }
            }
            else {
                parent.replaceChild(newChild.cloneNode(true), oldChild);
            }
        }
    }
    _updateAttributes(oldParent, newParent) {
        const oldAttributes = Array.from(oldParent.attributes);
        const newAttributes = Array.from(newParent.attributes);
        for (const attribute of oldAttributes) {
            if (!newParent.hasAttribute(attribute.name)) {
                oldParent.removeAttribute(attribute.name);
            }
        }
        for (const attribute of newAttributes) {
            if (!oldParent.hasAttribute(attribute.name)
                || oldParent.getAttribute(attribute.name) !== attribute.value) {
                oldParent.setAttribute(attribute.name, attribute.value);
            }
        }
    }
}
//# sourceMappingURL=NodeContent.js.map