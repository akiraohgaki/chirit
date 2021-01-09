const containerCollection = new WeakSet();
export default class NodeContent {
    constructor(container, context) {
        containerCollection.add(container);
        this._container = container;
        this._context = context;
    }
    get container() {
        return this._container;
    }
    update(content) {
        if (content instanceof Document || content instanceof DocumentFragment) {
            this._patchNodesInsideOf(this._container, content);
        }
        else {
            this._patchNodesInsideOf(this._container, this._createDocumentFragment(content));
        }
        this._fixOneventHandlersInsideOf(this._container);
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
            for (const node of Array.from(content)) {
                documentFragment.appendChild(node.cloneNode(true));
            }
        }
        return documentFragment;
    }
    _patchNodesInsideOf(original, diff) {
        var _a, _b;
        if (original.hasChildNodes() || diff.hasChildNodes()) {
            const originalChildNodes = Array.from(original.childNodes);
            const diffChildNodes = Array.from(diff.childNodes);
            const maxLength = Math.max(originalChildNodes.length, diffChildNodes.length);
            for (let i = 0; i < maxLength; i++) {
                this._patchNodes(original, (_a = originalChildNodes[i]) !== null && _a !== void 0 ? _a : null, (_b = diffChildNodes[i]) !== null && _b !== void 0 ? _b : null);
            }
        }
    }
    _patchNodes(parent, original, diff) {
        if (original && !diff) {
            parent.removeChild(original);
        }
        else if (!original && diff) {
            parent.appendChild(diff.cloneNode(true));
        }
        else if (original && diff) {
            if (original.nodeType === diff.nodeType && original.nodeName === diff.nodeName) {
                if (original instanceof Element && diff instanceof Element) {
                    this._patchAttributes(original, diff);
                    if (!containerCollection.has(original)) {
                        this._patchNodesInsideOf(original, diff);
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
            for (const attribute of Array.from(original.attributes)) {
                if (!diff.hasAttribute(attribute.name)) {
                    original.removeAttribute(attribute.name);
                }
            }
        }
        if (diff.hasAttributes()) {
            for (const attribute of Array.from(diff.attributes)) {
                if (!original.hasAttribute(attribute.name)
                    || original.getAttribute(attribute.name) !== attribute.value) {
                    original.setAttribute(attribute.name, attribute.value);
                }
            }
        }
    }
    _fixOneventHandlersInsideOf(target) {
        if (target.hasChildNodes()) {
            for (const node of Array.from(target.childNodes)) {
                if (node instanceof Element) {
                    this._fixOneventHandlers(node);
                }
            }
        }
    }
    _fixOneventHandlers(target) {
        var _a;
        if (target.hasAttributes()) {
            for (const attribute of Array.from(target.attributes)) {
                if (attribute.name.search(/^on\w+/i) !== -1) {
                    const onevent = attribute.name.toLowerCase();
                    const oneventTarget = target;
                    if (onevent in target && typeof oneventTarget[onevent] === 'function') {
                        const handler = new Function('event', attribute.value);
                        target.removeAttribute(attribute.name);
                        oneventTarget[onevent] = handler.bind((_a = this._context) !== null && _a !== void 0 ? _a : target);
                    }
                }
            }
        }
        if (!containerCollection.has(target)) {
            this._fixOneventHandlersInsideOf(target);
        }
    }
}
//# sourceMappingURL=NodeContent.js.map