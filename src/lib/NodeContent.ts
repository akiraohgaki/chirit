import {NodeContentData} from './types.js';

const containerCollection = new WeakSet();

export default class NodeContent<T extends Node> {

    private _container: T;

    private _context: object | undefined;

    constructor(container: T, context?: object) {
        containerCollection.add(container);

        //this._containerRef = new WeakRef(container);
        this._container = container;

        //this._contextRef = new WeakRef(context);
        this._context = context;
    }

    get container(): T {
        return this._container;
    }

    clone(): DocumentFragment {
        return this._createDocumentFragment(this._container.childNodes);
    }

    update(content: NodeContentData): void {
        if (content instanceof Document || content instanceof DocumentFragment) {
            this._patchChildNodes(this._container, content);
        }
        else {
            this._patchChildNodes(this._container, this._createDocumentFragment(content));
        }

        this._fixChildNodesOneventHandlers(this._container);
    }

    private _createDocumentFragment(content: NodeContentData): DocumentFragment {
        if (typeof content === 'string') {
            // !DOCTYPE, HTML, HEAD, BODY will stripped inside HTMLTemplateElement
            const template = document.createElement('template');
            template.innerHTML = content;
            return template.content;
        }

        // Some node types like DocumentType will not insert into DocumentFragment
        // ShadowRoot will not cloneable also not included in NodeList
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
        if (original.hasChildNodes() || diff.hasChildNodes()) {
            // Convert NodeList to array because NodeList of Node.childNodes is live
            // and it's index will change when that node's children has changed
            const originalChildNodes = Array.from(original.childNodes);
            const diffChildNodes = Array.from(diff.childNodes);
            const maxLength = Math.max(originalChildNodes.length, diffChildNodes.length);

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
            if (original.nodeType === diff.nodeType && original.nodeName === diff.nodeName) {
                if (original instanceof Element && diff instanceof Element) {
                    // The Element will be like HTMLElement, SVGElement
                    this._patchAttributes(original, diff);
                    // Continue patching recursively if the Element is normal node that not managed by this class
                    if (!containerCollection.has(original)) {
                        this._patchChildNodes(original, diff);
                    }
                }
                else if (original instanceof CharacterData && diff instanceof CharacterData) {
                    // The CharacterData will be like Text, Comment, ProcessingInstruction
                    if (original.nodeValue !== diff.nodeValue) {
                        original.nodeValue = diff.nodeValue;
                    }
                }
                else {
                    // The Node is any other node types
                    parent.replaceChild(diff.cloneNode(true), original);
                }
            }
            else {
                parent.replaceChild(diff.cloneNode(true), original);
            }
        }
    }

    private _patchAttributes(original: Element, diff: Element): void {
        // Convert NamedNodeMap to array because NamedNodeMap of Element.attributes is live
        // and it's index will change when that element's attributes has changed
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
                    || original.getAttribute(diffAttributes[i].name) !== diffAttributes[i].value
                ) {
                    original.setAttribute(diffAttributes[i].name, diffAttributes[i].value);
                }
            }
        }
    }

    private _fixChildNodesOneventHandlers(target: Node): void {
        if (target.hasChildNodes()) {
            const childNodes = target.childNodes;
            for (let i = 0; i < childNodes.length; i++) {
                if (childNodes[i] instanceof Element) {
                    this._fixOneventHandlers(childNodes[i] as Element);
                }
            }
        }
    }

    private _fixOneventHandlers(target: Element): void {
        if (target.hasAttributes()) {
            const attributes = Array.from(target.attributes);
            for (const attribute of attributes) {
                if (attribute.name.search(/^on\w+/i) !== -1) {
                    const onevent = attribute.name.toLowerCase();
                    const oneventTarget = (target as any) as {[key: string]: {(event: Event): unknown}};
                    if (onevent in target && typeof oneventTarget[onevent] === 'function') {
                        const handler = new Function(attribute.value);
                        target.removeAttribute(attribute.name);
                        oneventTarget[onevent] = handler.bind(this._context ?? target);
                    }
                }
            }
        }

        if (!containerCollection.has(target)) {
            this._fixChildNodesOneventHandlers(target);
        }
    }

}
