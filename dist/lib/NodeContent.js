export default class NodeContent {
    constructor(target) {
        this._target = target;
    }
    get target() {
        return this._target;
    }
    update(content, deep = true) {
        if (content instanceof Document || content instanceof DocumentFragment) {
            this._updateChildNodes(this._target, content, deep);
        }
        else {
            this._updateChildNodes(this._target, this._createDocumentFragment(content), deep);
        }
    }
    set(content) {
        this._target.textContent = null;
        if (content instanceof Document || content instanceof DocumentFragment) {
            this._target.appendChild(content.cloneNode(true));
        }
        else {
            this._target.appendChild(this._createDocumentFragment(content));
        }
    }
    get() {
        return this._createDocumentFragment(this._target.childNodes);
    }
    clear() {
        this._target.textContent = null;
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
    _updateChildNodes(oldParent, newParent, deep = true) {
        const oldChildNodes = Array.from(oldParent.childNodes);
        const newChildNodes = Array.from(newParent.childNodes);
        const maxLength = Math.max(oldChildNodes.length, newChildNodes.length);
        for (let i = 0; i < maxLength; i++) {
            this._updateChild(oldParent, oldChildNodes[i] || null, newChildNodes[i] || null, deep);
        }
    }
    _updateChild(parent, oldChild, newChild, deep = true) {
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
                    if (deep) {
                        this._updateChildNodes(oldChild, newChild, deep);
                    }
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