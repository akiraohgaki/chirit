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
            this._updateChildNodes(this._container, content);
        }
        else {
            this._updateChildNodes(this._container, this._createDocumentFragment(content));
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
        else if (content instanceof NodeList) {
            for (let i = 0; i < content.length; i++) {
                documentFragment.appendChild(content[i].cloneNode(true));
            }
        }
        return documentFragment;
    }

    private _updateChildNodes(oldParent: Node, newParent: Node): void {
        const oldChildNodes = Array.from(oldParent.childNodes);
        const newChildNodes = Array.from(newParent.childNodes);
        const maxLength = Math.max(oldChildNodes.length, newChildNodes.length);

        for (let i = 0; i < maxLength; i++) {
            this._updateChildNode(
                oldParent,
                oldChildNodes[i] ?? null,
                newChildNodes[i] ?? null
            );
        }
    }

    private _updateChildNode(parent: Node, oldChild: Node | null, newChild: Node | null): void {
        if (oldChild && !newChild) {
            parent.removeChild(oldChild);
        }
        else if (!oldChild && newChild) {
            parent.appendChild(newChild.cloneNode(true));
        }
        else if (oldChild && newChild) {
            if (oldChild.nodeType === newChild.nodeType
                && oldChild.nodeName === newChild.nodeName
            ) {
                // Current child is same node type and/or same tag name
                if (oldChild instanceof Element && newChild instanceof Element) {
                    // Current child is Element like HTMLElement, SVGElement
                    this._updateAttributes(oldChild, newChild);
                    // Update recursively
                    this._updateChildNodes(oldChild, newChild);
                }
                else if (oldChild instanceof CharacterData && newChild instanceof CharacterData) {
                    // Current child is CharacterData like Text, Comment, ProcessingInstruction
                    if (oldChild.nodeValue !== newChild.nodeValue) {
                        oldChild.nodeValue = newChild.nodeValue;
                    }
                }
                else {
                    // Current child is any other node type like DocumentType
                    parent.replaceChild(newChild.cloneNode(true), oldChild);
                }
            }
            else {
                // Current child is different node type or different tag name
                parent.replaceChild(newChild.cloneNode(true), oldChild);
            }
        }
    }

    private _updateAttributes(oldParent: Element, newParent: Element): void {
        const oldAttributes = Array.from(oldParent.attributes);
        const newAttributes = Array.from(newParent.attributes);

        for (const attribute of oldAttributes) {
            if (!newParent.hasAttribute(attribute.name)) {
                oldParent.removeAttribute(attribute.name);
            }
        }

        for (const attribute of newAttributes) {
            if (!oldParent.hasAttribute(attribute.name)
                || oldParent.getAttribute(attribute.name) !== attribute.value
            ) {
                oldParent.setAttribute(attribute.name, attribute.value);
            }
        }
    }

}
