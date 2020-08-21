import {NodeContentData} from './types.js';

export default class NodeContent {

    private _target: Node;

    constructor(target: Node) {
        this._target = target;
    }

    get target(): Node {
        return this._target;
    }

    update(content: NodeContentData, deep: boolean = false): void {
        if (content instanceof Document || content instanceof DocumentFragment) {
            this._updateChildNodes(this._target, content, deep);
        }
        else {
            this._updateChildNodes(this._target, this._createDocumentFragment(content), deep);
        }
    }

    set(content: NodeContentData): void {
        this._target.textContent = null;

        if (content instanceof Document || content instanceof DocumentFragment) {
            this._target.appendChild(content.cloneNode(true));
        }
        else {
            this._target.appendChild(this._createDocumentFragment(content));
        }
    }

    get(): DocumentFragment {
        return this._createDocumentFragment(this._target.childNodes);
    }

    clear(): void {
        this._target.textContent = null;
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

    private _updateChildNodes(oldParent: Node, newParent: Node, deep: boolean): void {
        const oldChildNodes = Array.from(oldParent.childNodes);
        const newChildNodes = Array.from(newParent.childNodes);
        const maxLength = Math.max(oldChildNodes.length, newChildNodes.length);

        for (let i = 0; i < maxLength; i++) {
            this._updateChild(
                oldParent,
                oldChildNodes[i] ?? null,
                newChildNodes[i] ?? null,
                deep
            );
        }
    }

    private _updateChild(parent: Node, oldChild: Node | null, newChild: Node | null, deep: boolean): void {
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

                    if (deep) {
                        this._updateChildNodes(oldChild, newChild, deep);
                    }
                }
                else if (oldChild instanceof CharacterData && newChild instanceof CharacterData) {
                    // Current child is CharacterData like Text, Comment, ProcessingInstruction
                    if (oldChild.nodeValue !== newChild.nodeValue) {
                        oldChild.nodeValue = newChild.nodeValue;
                    }
                }
                else {
                    // Current child is any other node type like DocumentType
                    // Just replace it for now
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
