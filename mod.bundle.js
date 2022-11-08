// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const __default = {
    globalThis: globalThis
};
const BaseElement = __default.globalThis.HTMLElement;
class CustomElement extends BaseElement {
    #updateCounter;
    #updateTimerId;
    #updateDelay;
    #updatePromiseResolvers;
    constructor(){
        super();
        this.#updateCounter = 0;
        this.#updateTimerId = undefined;
        this.#updateDelay = 100;
        this.#updatePromiseResolvers = [];
    }
    static get observedAttributes() {
        return [];
    }
    attributeChangedCallback(_name, oldValue, newValue, _namespace) {
        if (this.#updateCounter && oldValue !== newValue) {
            this.update();
        }
    }
    connectedCallback() {
        if (this.#updateCounter) {
            this.update();
        } else {
            this.updateSync();
        }
    }
    disconnectedCallback() {}
    adoptedCallback(_oldDocument, _newDocument) {}
    static define(name, options) {
        __default.globalThis.customElements.define(name, this, options);
    }
    get updateCounter() {
        return this.#updateCounter;
    }
    update() {
        if (this.#updateTimerId !== undefined) {
            __default.globalThis.clearTimeout(this.#updateTimerId);
            this.#updateTimerId = undefined;
        }
        this.#updateTimerId = __default.globalThis.setTimeout(()=>{
            __default.globalThis.clearTimeout(this.#updateTimerId);
            this.#updateTimerId = undefined;
            const promiseResolvers = this.#updatePromiseResolvers.splice(0);
            this.updateSync();
            if (promiseResolvers.length) {
                for (const resolve of promiseResolvers){
                    resolve();
                }
            }
        }, this.#updateDelay);
        return new Promise((resolve)=>{
            this.#updatePromiseResolvers.push(resolve);
        });
    }
    updateSync() {
        try {
            this.render();
            this.#updateCounter++;
            this.updatedCallback();
        } catch (exception) {
            this.errorCallback(exception);
        }
    }
    render() {}
    updatedCallback() {}
    errorCallback(exception) {
        console.error(exception);
    }
}
class ElementAttributesProxy {
    constructor(target){
        let targetRef = new WeakRef(target);
        const getTarget = ()=>{
            if (targetRef) {
                const target = targetRef.deref();
                if (target) {
                    return target;
                } else {
                    targetRef = null;
                }
            }
            throw new Error('The element not available.');
        };
        return new Proxy({}, {
            set: (_target, name, value)=>{
                const target = getTarget();
                if (typeof name === 'string' && typeof value === 'string') {
                    target.setAttribute(name, value);
                    return true;
                }
                return false;
            },
            get: (_target, name)=>{
                const target = getTarget();
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    return target.getAttribute(name);
                }
                return undefined;
            },
            deleteProperty: (_target, name)=>{
                const target = getTarget();
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    target.removeAttribute(name);
                    return true;
                }
                return false;
            },
            has: (_target, name)=>{
                const target = getTarget();
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    return true;
                }
                return false;
            },
            ownKeys: ()=>{
                const target = getTarget();
                const keys = [];
                if (target.hasAttributes()) {
                    for (const attribute of Array.from(target.attributes)){
                        keys.push(attribute.name);
                    }
                }
                return keys;
            },
            getOwnPropertyDescriptor: (_target, name)=>{
                const target = getTarget();
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    return {
                        configurable: true,
                        enumerable: true,
                        value: target.getAttribute(name)
                    };
                }
                return undefined;
            }
        });
    }
}
const containerCollection = new WeakSet();
class NodeContent {
    #containerRef;
    #contextRef;
    constructor(container, context){
        containerCollection.add(container);
        this.#containerRef = new WeakRef(container);
        this.#contextRef = context ? new WeakRef(context) : null;
    }
    get container() {
        return this.#getContainer();
    }
    update(content) {
        const container = this.#getContainer();
        if (content instanceof __default.globalThis.Document || content instanceof __default.globalThis.DocumentFragment) {
            this.#patchNodesInsideOf(container, content);
        } else {
            this.#patchNodesInsideOf(container, this.#createDocumentFragment(content));
        }
        this.#fixOneventHandlersInsideOf(container);
    }
    clone() {
        const container = this.#getContainer();
        return this.#createDocumentFragment(container.childNodes);
    }
    #getContainer() {
        if (this.#containerRef) {
            const container = this.#containerRef.deref();
            if (container) {
                return container;
            } else {
                this.#containerRef = null;
            }
        }
        throw new Error('The node not available.');
    }
    #getContext() {
        if (this.#contextRef) {
            const context = this.#contextRef.deref();
            if (context) {
                return context;
            } else {
                this.#contextRef = null;
            }
        }
        return undefined;
    }
    #createDocumentFragment(content) {
        if (typeof content === 'string') {
            const template = __default.globalThis.document.createElement('template');
            template.innerHTML = content;
            return template.content;
        }
        const documentFragment = __default.globalThis.document.createDocumentFragment();
        if (content instanceof __default.globalThis.Node) {
            documentFragment.appendChild(content.cloneNode(true));
        } else if (content instanceof __default.globalThis.NodeList && content.length) {
            for (const node of Array.from(content)){
                documentFragment.appendChild(node.cloneNode(true));
            }
        }
        return documentFragment;
    }
    #patchNodesInsideOf(original, diff) {
        if (original.hasChildNodes() || diff.hasChildNodes()) {
            const originalChildNodes = Array.from(original.childNodes);
            const diffChildNodes = Array.from(diff.childNodes);
            const maxLength = Math.max(originalChildNodes.length, diffChildNodes.length);
            for(let i = 0; i < maxLength; i++){
                this.#patchNodes(original, originalChildNodes[i] ?? null, diffChildNodes[i] ?? null);
            }
        }
    }
    #patchNodes(parent, original1, diff1) {
        if (original1 && !diff1) {
            parent.removeChild(original1);
        } else if (!original1 && diff1) {
            parent.appendChild(diff1.cloneNode(true));
        } else if (original1 && diff1) {
            if (original1.nodeType === diff1.nodeType && original1.nodeName === diff1.nodeName) {
                if (original1 instanceof __default.globalThis.Element && diff1 instanceof __default.globalThis.Element) {
                    this.#patchAttributes(original1, diff1);
                    if (!containerCollection.has(original1)) {
                        this.#patchNodesInsideOf(original1, diff1);
                    }
                } else if (original1 instanceof __default.globalThis.CharacterData && diff1 instanceof __default.globalThis.CharacterData) {
                    if (original1.nodeValue !== diff1.nodeValue) {
                        original1.nodeValue = diff1.nodeValue;
                    }
                } else {
                    parent.replaceChild(diff1.cloneNode(true), original1);
                }
            } else {
                parent.replaceChild(diff1.cloneNode(true), original1);
            }
        }
    }
    #patchAttributes(original2, diff2) {
        if (original2.hasAttributes()) {
            for (const attribute of Array.from(original2.attributes)){
                if (!diff2.hasAttribute(attribute.name)) {
                    original2.removeAttribute(attribute.name);
                }
            }
        }
        if (diff2.hasAttributes()) {
            for (const attribute1 of Array.from(diff2.attributes)){
                if (!original2.hasAttribute(attribute1.name) || original2.getAttribute(attribute1.name) !== attribute1.value) {
                    original2.setAttribute(attribute1.name, attribute1.value);
                }
            }
        }
    }
    #fixOneventHandlersInsideOf(target) {
        if (target.hasChildNodes()) {
            for (const node1 of Array.from(target.childNodes)){
                if (node1 instanceof __default.globalThis.Element) {
                    this.#fixOneventHandlers(node1);
                }
            }
        }
    }
    #fixOneventHandlers(target1) {
        if (target1.hasAttributes()) {
            for (const attribute2 of Array.from(target1.attributes)){
                if (attribute2.name.search(/^on\w+/i) !== -1) {
                    const onevent = attribute2.name.toLowerCase();
                    const oneventTarget = target1;
                    if (onevent in target1 && typeof oneventTarget[onevent] === 'function') {
                        const handler = new Function('event', attribute2.value);
                        const context1 = this.#getContext();
                        target1.removeAttribute(attribute2.name);
                        oneventTarget[onevent] = handler.bind(context1 ?? target1);
                    }
                }
            }
        }
        if (!containerCollection.has(target1)) {
            this.#fixOneventHandlersInsideOf(target1);
        }
    }
}
class Component extends CustomElement {
    #attrs;
    #content;
    constructor(){
        super();
        this.#attrs = new ElementAttributesProxy(this);
        this.#content = new NodeContent(this.createContentContainer(), this);
    }
    get attrs() {
        return this.#attrs;
    }
    get content() {
        return this.#content;
    }
    dispatch(type, detail) {
        return this.#content.container.dispatchEvent(new __default.globalThis.CustomEvent(type, {
            detail: detail,
            bubbles: true,
            composed: true
        }));
    }
    createContentContainer() {
        return this.attachShadow({
            mode: 'open'
        });
    }
    render() {
        this.#content.update(this.template());
    }
    template() {
        return '';
    }
}
class Observable {
    #observerCollection;
    constructor(){
        this.#observerCollection = new Set();
    }
    subscribe(observer) {
        this.#observerCollection.add(observer);
    }
    unsubscribe(observer) {
        this.#observerCollection.delete(observer);
    }
    notify(value) {
        if (this.#observerCollection.size) {
            for (const observer of this.#observerCollection){
                observer(value);
            }
        }
    }
}
class ObservableValue extends Observable {
    #value;
    constructor(value){
        super();
        this.#value = value;
    }
    set(value) {
        this.#value = value;
        this.notify();
    }
    get() {
        return this.#value;
    }
    notify() {
        super.notify(this.#value);
    }
}
class Router {
    #mode;
    #base;
    #onchange;
    #onerror;
    #routeCollection;
    #hashchangeCallback;
    #popstateCallback;
    constructor(mode, base = ''){
        if (mode !== 'hash' && mode !== 'history') {
            throw new Error('The mode must be set "hash" or "history".');
        }
        this.#mode = mode;
        this.#base = base && !base.endsWith('/') ? base + '/' : base;
        this.#onchange = ()=>{};
        this.#onerror = (exception)=>{
            console.error(exception);
        };
        this.#routeCollection = new Map();
        this.#hashchangeCallback = this.#handleHashchange.bind(this);
        this.#popstateCallback = this.#handlePopstate.bind(this);
    }
    get mode() {
        return this.#mode;
    }
    get base() {
        return this.#base;
    }
    set onchange(handler) {
        this.#onchange = handler;
    }
    get onchange() {
        return this.#onchange;
    }
    set onerror(handler) {
        this.#onerror = handler;
    }
    get onerror() {
        return this.#onerror;
    }
    set(pattern, handler) {
        if (!this.#routeCollection.size) {
            if (this.#mode === 'hash') {
                __default.globalThis.addEventListener('hashchange', this.#hashchangeCallback);
            } else if (this.#mode === 'history') {
                __default.globalThis.addEventListener('popstate', this.#popstateCallback);
            }
        }
        this.#routeCollection.set(this.#fixRoutePattern(pattern), handler);
    }
    delete(pattern) {
        this.#routeCollection.delete(this.#fixRoutePattern(pattern));
        if (!this.#routeCollection.size) {
            if (this.#mode === 'hash') {
                __default.globalThis.removeEventListener('hashchange', this.#hashchangeCallback);
            } else if (this.#mode === 'history') {
                __default.globalThis.removeEventListener('popstate', this.#popstateCallback);
            }
        }
    }
    navigate(url) {
        if (this.#mode === 'hash') {
            this.#navigateWithHashMode(url);
        } else if (this.#mode === 'history') {
            this.#navigateWithHistoryMode(url);
        }
    }
    #navigateWithHashMode(url) {
        let newVirtualPath = '';
        if (url.search(/^https?:\/\/|\?|#/i) !== -1) {
            const newUrl = new __default.globalThis.URL(url, __default.globalThis.location.href);
            const newUrlParts = newUrl.href.split('#');
            const oldUrlParts = __default.globalThis.location.href.split('#');
            if (newUrlParts[0] !== oldUrlParts[0]) {
                __default.globalThis.location.href = newUrl.href;
                return;
            }
            newVirtualPath = newUrlParts[1] ?? '';
        } else {
            newVirtualPath = url;
        }
        const oldVirtualPath = __default.globalThis.location.hash.substring(1);
        const oldVirtualUrl = new __default.globalThis.URL(oldVirtualPath, __default.globalThis.location.origin);
        const newVirtualUrl = new __default.globalThis.URL(this.#resolveBaseUrl(newVirtualPath), oldVirtualUrl.href);
        if (newVirtualUrl.pathname !== oldVirtualPath) {
            __default.globalThis.location.hash = newVirtualUrl.pathname;
            return;
        }
        this.#invokeRouteHandler(newVirtualUrl.pathname);
    }
    #navigateWithHistoryMode(url1) {
        const newUrl1 = new __default.globalThis.URL(this.#resolveBaseUrl(url1), __default.globalThis.location.href);
        if (newUrl1.origin !== __default.globalThis.location.origin) {
            __default.globalThis.location.href = newUrl1.href;
            return;
        }
        if (newUrl1.href !== __default.globalThis.location.href) {
            __default.globalThis.history.pushState({}, '', newUrl1.href);
            this.#onchange(new __default.globalThis.CustomEvent('pushstate'));
        }
        this.#invokeRouteHandler(newUrl1.pathname);
    }
    #handleHashchange(event) {
        this.#onchange(event);
        this.#invokeRouteHandler(__default.globalThis.location.hash.substring(1));
    }
    #handlePopstate(event1) {
        this.#onchange(event1);
        this.#invokeRouteHandler(__default.globalThis.location.pathname);
    }
    #invokeRouteHandler(path) {
        try {
            if (this.#routeCollection.size) {
                for (const [pattern, handler1] of this.#routeCollection){
                    const matches = path.match(new RegExp(pattern));
                    if (matches) {
                        handler1(matches.groups ?? {});
                        break;
                    }
                }
            }
        } catch (exception) {
            this.#onerror(exception);
        }
    }
    #resolveBaseUrl(url2) {
        return this.#base && url2.search(/^(https?:\/\/|\/)/i) === -1 ? this.#base + url2 : url2;
    }
    #fixRoutePattern(pattern1) {
        return `/${pattern1}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
    }
}
class WebStorage {
    #mode;
    #prefix;
    #storage;
    constructor(mode, prefix = ''){
        this.#mode = mode;
        this.#prefix = prefix;
        switch(this.#mode){
            case 'local':
                {
                    this.#storage = __default.globalThis.localStorage;
                    break;
                }
            case 'session':
                {
                    this.#storage = __default.globalThis.sessionStorage;
                    break;
                }
            default:
                {
                    throw new Error('The mode must be set "local" or "session".');
                }
        }
    }
    get mode() {
        return this.#mode;
    }
    get prefix() {
        return this.#prefix;
    }
    get size() {
        return this.#storage.length;
    }
    keys() {
        const keys = [];
        if (this.#storage.length) {
            for(let i = 0; i < this.#storage.length; i++){
                keys.push(this.#storage.key(i));
            }
        }
        return keys;
    }
    set(key, value) {
        this.#storage.setItem(this.#prefix + key, JSON.stringify({
            _k: key,
            _v: value
        }));
    }
    get(key) {
        const value = this.#storage.getItem(this.#prefix + key);
        if (value) {
            try {
                const deserializedValue = JSON.parse(value);
                if (deserializedValue?._k === key) {
                    return deserializedValue._v;
                }
            } catch  {
                return value;
            }
        }
        return value;
    }
    delete(key) {
        this.#storage.removeItem(this.#prefix + key);
    }
    clear() {
        this.#storage.clear();
    }
}
export { Component as Component };
export { CustomElement as CustomElement };
export { ElementAttributesProxy as ElementAttributesProxy };
export { NodeContent as NodeContent };
export { Observable as Observable };
export { ObservableValue as ObservableValue };
export { Router as Router };
export { WebStorage as WebStorage };
