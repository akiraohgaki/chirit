import {NodeContentData} from './types.js';

const containerCollection = new WeakSet();

export default class NodeContent<T extends Node> {

    private _container: T;

    private _context: any;

    constructor(container: T, context?: any) {
        containerCollection.add(container);

        //this._containerRef = new WeakRef(container);
        this._container = container;

        //this._contextRef = new WeakRef(context);
        this._context = context;
    }

    get container(): T {
        return this._container;
    }

    update(content: NodeContentData): void {
        if (content instanceof Document || content instanceof DocumentFragment) {
            this._patchNodesInsideOf(this._container, content);
        }
        else {
            this._patchNodesInsideOf(this._container, this._createDocumentFragment(content));
        }

        this._fixOneventHandlersInsideOf(this._container);
    }

    clone(): DocumentFragment {
        return this._createDocumentFragment(this._container.childNodes);
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
            for (const node of Array.from(content)) {
                documentFragment.appendChild(node.cloneNode(true));
            }
        }
        return documentFragment;
    }

    private _patchNodesInsideOf(original: Node, diff: Node): void {
        if (original.hasChildNodes() || diff.hasChildNodes()) {
            // NodeList of Node.childNodes is live so must be convert to array
            const originalChildNodes = Array.from(original.childNodes);
            const diffChildNodes = Array.from(diff.childNodes);
            const maxLength = Math.max(originalChildNodes.length, diffChildNodes.length);

            for (let i = 0; i < maxLength; i++) {
                this._patchNodes(
                    original,
                    originalChildNodes[i] ?? null,
                    diffChildNodes[i] ?? null
                );
            }
        }
    }

    private _patchNodes(parent: Node, original: Node | null, diff: Node | null): void {
        if (original && !diff) {
            parent.removeChild(original);
        }
        else if (!original && diff) {
            parent.appendChild(diff.cloneNode(true));
        }
        else if (original && diff) {
            if (original.nodeType === diff.nodeType && original.nodeName === diff.nodeName) {
                if (original instanceof Element && diff instanceof Element) {
                    // Element it's HTMLElement, SVGElement
                    this._patchAttributes(original, diff);
                    if (!containerCollection.has(original)) {
                        this._patchNodesInsideOf(original, diff);
                    }
                }
                else if (original instanceof CharacterData && diff instanceof CharacterData) {
                    // CharacterData it's Text, Comment, ProcessingInstruction
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

    private _patchAttributes(original: Element, diff: Element): void {
        // NamedNodeMap of Element.attributes is live so must be convert to array
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
                    || original.getAttribute(attribute.name) !== attribute.value
                ) {
                    original.setAttribute(attribute.name, attribute.value);
                }
            }
        }
    }

    private _fixOneventHandlersInsideOf(target: Node): void {
        if (target.hasChildNodes()) {
            for (const node of Array.from(target.childNodes)) {
                if (node instanceof Element) {
                    this._fixOneventHandlers(node);
                }
            }
        }
    }

    private _fixOneventHandlers(target: Element): void {
        if (target.hasAttributes()) {
            // NamedNodeMap of Element.attributes is live so must be convert to array
            for (const attribute of Array.from(target.attributes)) {
                if (attribute.name.search(/^on\w+/i) !== -1) {
                    const onevent = attribute.name.toLowerCase();
                    const oneventTarget = (target as any) as {[key: string]: {(event: Event): unknown}};
                    if (onevent in target && typeof oneventTarget[onevent] === 'function') {
                        const handler = new Function('event', attribute.value);
                        target.removeAttribute(attribute.name);
                        oneventTarget[onevent] = handler.bind(this._context ?? target);
                    }
                }
            }
        }

        if (!containerCollection.has(target)) {
            this._fixOneventHandlersInsideOf(target);
        }
    }

}
