const containerCollection = new WeakSet();
export default class NodeContent {
    constructor(container) {
        containerCollection.add(container);
        this._container = container;
    }
    get container() {
        return this._container;
    }
    update(content) {
        if (content instanceof Document || content instanceof DocumentFragment) {
            this._patchChildNodes(this._container, content);
        }
        else {
            this._patchChildNodes(this._container, this._createDocumentFragment(content));
        }
    }
    clone() {
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
        else if (content instanceof NodeList && content.length) {
            for (let i = 0; i < content.length; i++) {
                documentFragment.appendChild(content[i].cloneNode(true));
            }
        }
        return documentFragment;
    }
    _patchChildNodes(original, diff) {
        var _a, _b;
        const originalChildNodes = Array.from(original.childNodes);
        const diffChildNodes = Array.from(diff.childNodes);
        const maxLength = Math.max(originalChildNodes.length, diffChildNodes.length);
        if (maxLength) {
            for (let i = 0; i < maxLength; i++) {
                this._patchNode(original, (_a = originalChildNodes[i]) !== null && _a !== void 0 ? _a : null, (_b = diffChildNodes[i]) !== null && _b !== void 0 ? _b : null);
            }
        }
    }
    _patchNode(parent, original, diff) {
        if (original && !diff) {
            parent.removeChild(original);
        }
        else if (!original && diff) {
            parent.appendChild(diff.cloneNode(true));
        }
        else if (original && diff) {
            if (original.nodeType === diff.nodeType
                && original.nodeName === diff.nodeName) {
                if (original instanceof Element && diff instanceof Element) {
                    this._patchAttributes(original, diff);
                    if (!containerCollection.has(original)) {
                        this._patchChildNodes(original, diff);
                    }
                }
                else if (original instanceof CharacterData && diff instanceof CharacterData) {
                    if (original.nodeValue !== diff.nodeValue) {
                        original.nodeValue = diff.nodeValue;
                    }
                }
                else {
                    parent.replaceChild(diff.cloneNode(true), original);
                }
            }
            else {
                parent.replaceChild(diff.cloneNode(true), original);
            }
        }
    }
    _patchAttributes(original, diff) {
        if (original.hasAttributes()) {
            const originalAttributes = Array.from(original.attributes);
            for (let i = 0; i < originalAttributes.length; i++) {
                if (!diff.hasAttribute(originalAttributes[i].name)) {
                    original.removeAttribute(originalAttributes[i].name);
                }
            }
        }
        if (diff.hasAttributes()) {
            const diffAttributes = Array.from(diff.attributes);
            for (let i = 0; i < diffAttributes.length; i++) {
                if (!original.hasAttribute(diffAttributes[i].name)
                    || original.getAttribute(diffAttributes[i].name) !== diffAttributes[i].value) {
                    original.setAttribute(diffAttributes[i].name, diffAttributes[i].value);
                }
            }
        }
    }
}
//# sourceMappingURL=NodeContent.js.map