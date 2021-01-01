import {NodeContentData} from './types.js';

export default class NodeContent<T extends Node> {

    private _container: T;

    constructor(container: T) {
        this._container = container;
    }

    get container(): T {
        return this._container;
    }

    update(content: NodeContentData): void {
        if (content instanceof Document || content instanceof DocumentFragment) {
            this._patchChildNodes(this._container, content);
        }
        else {
            this._patchChildNodes(this._container, this._createDocumentFragment(content));
        }
    }

    clone(): DocumentFragment {
        return this._createDocumentFragment(this._container.childNodes);
    }

    private _createDocumentFragment(content: NodeContentData): DocumentFragment {
        if (typeof content === 'string') {
            // !DOCTYPE, HTML, HEAD, BODY will be stripped inside HTMLTemplateElement
            const template = document.createElement('template');
            template.innerHTML = content;
            return template.content;
        }

        // DocumentType may not be inserted inside DocumentFragment
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

    private _patchChildNodes(original: Node, diff: Node): void {
        const originalChildNodes = original.childNodes;
        const diffChildNodes = diff.childNodes;
        const maxLength = Math.max(originalChildNodes.length, diffChildNodes.length);

        if (maxLength) {
            for (let i = 0; i < maxLength; i++) {
                this._patchNode(
                    original,
                    originalChildNodes[i] ?? null,
                    diffChildNodes[i] ?? null
                );
            }
        }
    }

    private _patchNode(parent: Node, original: Node | null, diff: Node | null): void {
        if (original && !diff) {
            parent.removeChild(original);
        }
        else if (!original && diff) {
            parent.appendChild(diff.cloneNode(true));
        }
        else if (original && diff) {
            if (original.nodeType === diff.nodeType
                && original.nodeName === diff.nodeName
            ) {
                if (original instanceof Element && diff instanceof Element) {
                    // The Element will be like HTMLElement, SVGElement
                    this._patchAttributes(original, diff);
                    // Continue patching recursively
                    this._patchChildNodes(original, diff);
                }
                else if (original instanceof CharacterData && diff instanceof CharacterData) {
                    // The CharacterData will be like Text, Comment, ProcessingInstruction
                    if (original.nodeValue !== diff.nodeValue) {
                        original.nodeValue = diff.nodeValue;
                    }
                }
                else {
                    // Any other node type like DocumentType, just replace it for now
                    parent.replaceChild(diff.cloneNode(true), original);
                }
            }
            else {
                parent.replaceChild(diff.cloneNode(true), original);
            }
        }
    }

    private _patchAttributes(original: Element, diff: Element): void {
        if (original.hasAttributes()) {
            const originalAttributes = original.attributes;
            for (let i = 0; i < originalAttributes.length; i++) {
                if (!diff.hasAttribute(originalAttributes[i].name)) {
                    original.removeAttribute(originalAttributes[i].name);
                }
            }
        }

        if (diff.hasAttributes()) {
            const diffAttributes = diff.attributes;
            for (let i = 0; i < diffAttributes.length; i++) {
                if (!original.hasAttribute(diffAttributes[i].name)
                    || original.getAttribute(diffAttributes[i].name) !== diffAttributes[i].value
                ) {
                    original.setAttribute(diffAttributes[i].name, diffAttributes[i].value);
                }
            }
        }
    }

}
