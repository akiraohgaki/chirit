const VERSION = '1.3.0';
export { VERSION as VERSION };
const __default = {
    globalThis: globalThis
};
const BaseElement = __default.globalThis.HTMLElement;
class CustomElement extends BaseElement {
    #updateCounter;
    #updateTimerId;
    #updateDelay;
    #updatePromiseResolvers;
    static get observedAttributes() {
        return [];
    }
    static define(name, options) {
        __default.globalThis.customElements.define(name, this, options);
    }
    constructor(){
        super();
        this.#updateCounter = 0;
        this.#updateTimerId = undefined;
        this.#updateDelay = 100;
        this.#updatePromiseResolvers = [];
    }
    get updateCounter() {
        return this.#updateCounter;
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
            for (const attribute of Array.from(diff2.attributes)){
                if (!original2.hasAttribute(attribute.name) || original2.getAttribute(attribute.name) !== attribute.value) {
                    original2.setAttribute(attribute.name, attribute.value);
                }
            }
        }
    }
    #fixOneventHandlersInsideOf(target) {
        if (target.hasChildNodes()) {
            for (const node of Array.from(target.childNodes)){
                if (node instanceof __default.globalThis.Element) {
                    this.#fixOneventHandlers(node);
                }
            }
        }
    }
    #fixOneventHandlers(target1) {
        if (target1.hasAttributes()) {
            for (const attribute of Array.from(target1.attributes)){
                if (attribute.name.search(/^on\w+/i) !== -1) {
                    const onevent = attribute.name.toLowerCase();
                    const oneventTarget = target1;
                    if (onevent in target1 && typeof oneventTarget[onevent] === 'function') {
                        const handler = new Function('event', attribute.value);
                        const context = this.#getContext();
                        target1.removeAttribute(attribute.name);
                        oneventTarget[onevent] = handler.bind(context ?? target1);
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
        this.update = this.update.bind(this);
        this.#attrs = new ElementAttributesProxy(this);
        this.#content = new NodeContent(this.createContentContainer(), this);
    }
    get attrs() {
        return this.#attrs;
    }
    get content() {
        return this.#content;
    }
    observe(...args) {
        if (args.length) {
            for (const arg of args){
                if (arg.subscribe && typeof arg.subscribe === 'function') {
                    arg.subscribe(this.update);
                }
            }
        }
    }
    unobserve(...args) {
        if (args.length) {
            for (const arg of args){
                if (arg.unsubscribe && typeof arg.unsubscribe === 'function') {
                    arg.unsubscribe(this.update);
                }
            }
        }
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
        const newUrl = new __default.globalThis.URL(this.#resolveBaseUrl(url1), __default.globalThis.location.href);
        if (newUrl.origin !== __default.globalThis.location.origin) {
            __default.globalThis.location.href = newUrl.href;
            return;
        }
        if (newUrl.href !== __default.globalThis.location.href) {
            __default.globalThis.history.pushState({}, '', newUrl.href);
            this.#onchange(new __default.globalThis.CustomEvent('pushstate'));
        }
        this.#invokeRouteHandler(newUrl.pathname);
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
                for (const [pattern, handler] of this.#routeCollection){
                    const matches = path.match(new RegExp(pattern));
                    if (matches) {
                        handler(matches.groups ?? {});
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
    #fixRoutePattern(pattern) {
        return `/${pattern}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
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
function createComponent(name, options) {
    const CustomComponent = class extends Component {
        static get observedAttributes() {
            return options?.observedAttributes && Array.isArray(options.observedAttributes) ? options.observedAttributes : super.observedAttributes;
        }
        constructor(){
            super();
            if (options?.init && typeof options.init === 'function') {
                options.init(this);
            }
        }
        connectedCallback() {
            super.connectedCallback();
            if (options?.connected && typeof options.connected === 'function') {
                options.connected(this);
            }
        }
        disconnectedCallback() {
            if (options?.disconnected && typeof options.disconnected === 'function') {
                options.disconnected(this);
            }
            super.disconnectedCallback();
        }
        template() {
            return options?.template && typeof options.template === 'function' ? options.template(this) : super.template();
        }
    };
    CustomComponent.define(name);
    return CustomComponent;
}
export { Component as Component };
export { CustomElement as CustomElement };
export { ElementAttributesProxy as ElementAttributesProxy };
export { NodeContent as NodeContent };
export { Observable as Observable };
export { ObservableValue as ObservableValue };
export { Router as Router };
export { WebStorage as WebStorage };
export { createComponent as createComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvd29yay9jaGlyaXQvY2hpcml0L3ZlcnNpb24udHMiLCJmaWxlOi8vL2hvbWUvcnVubmVyL3dvcmsvY2hpcml0L2NoaXJpdC9zcmMvZG9tLnRzIiwiZmlsZTovLy9ob21lL3J1bm5lci93b3JrL2NoaXJpdC9jaGlyaXQvc3JjL0N1c3RvbUVsZW1lbnQudHMiLCJmaWxlOi8vL2hvbWUvcnVubmVyL3dvcmsvY2hpcml0L2NoaXJpdC9zcmMvRWxlbWVudEF0dHJpYnV0ZXNQcm94eS50cyIsImZpbGU6Ly8vaG9tZS9ydW5uZXIvd29yay9jaGlyaXQvY2hpcml0L3NyYy9Ob2RlQ29udGVudC50cyIsImZpbGU6Ly8vaG9tZS9ydW5uZXIvd29yay9jaGlyaXQvY2hpcml0L3NyYy9Db21wb25lbnQudHMiLCJmaWxlOi8vL2hvbWUvcnVubmVyL3dvcmsvY2hpcml0L2NoaXJpdC9zcmMvT2JzZXJ2YWJsZS50cyIsImZpbGU6Ly8vaG9tZS9ydW5uZXIvd29yay9jaGlyaXQvY2hpcml0L3NyYy9PYnNlcnZhYmxlVmFsdWUudHMiLCJmaWxlOi8vL2hvbWUvcnVubmVyL3dvcmsvY2hpcml0L2NoaXJpdC9zcmMvUm91dGVyLnRzIiwiZmlsZTovLy9ob21lL3J1bm5lci93b3JrL2NoaXJpdC9jaGlyaXQvc3JjL1dlYlN0b3JhZ2UudHMiLCJmaWxlOi8vL2hvbWUvcnVubmVyL3dvcmsvY2hpcml0L2NoaXJpdC9zcmMvY3JlYXRlQ29tcG9uZW50LnRzIiwiZmlsZTovLy9ob21lL3J1bm5lci93b3JrL2NoaXJpdC9jaGlyaXQvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBWRVJTSU9OID0gJzEuMy4wJztcbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgZ2xvYmFsVGhpczogZ2xvYmFsVGhpcyxcbn07XG4iLCJpbXBvcnQgZG9tIGZyb20gJy4vZG9tLnRzJztcblxuY29uc3QgQmFzZUVsZW1lbnQgPSBkb20uZ2xvYmFsVGhpcy5IVE1MRWxlbWVudDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3VzdG9tRWxlbWVudCBleHRlbmRzIEJhc2VFbGVtZW50IHtcbiAgI3VwZGF0ZUNvdW50ZXI6IG51bWJlcjtcblxuICAjdXBkYXRlVGltZXJJZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAjdXBkYXRlRGVsYXk6IG51bWJlcjtcbiAgI3VwZGF0ZVByb21pc2VSZXNvbHZlcnM6IEFycmF5PHsgKCk6IHZvaWQgfT47XG5cbiAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgc3RhdGljIGRlZmluZShuYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBFbGVtZW50RGVmaW5pdGlvbk9wdGlvbnMpOiB2b2lkIHtcbiAgICBkb20uZ2xvYmFsVGhpcy5jdXN0b21FbGVtZW50cy5kZWZpbmUobmFtZSwgdGhpcywgb3B0aW9ucyk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy4jdXBkYXRlQ291bnRlciA9IDA7XG5cbiAgICB0aGlzLiN1cGRhdGVUaW1lcklkID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuI3VwZGF0ZURlbGF5ID0gMTAwO1xuICAgIHRoaXMuI3VwZGF0ZVByb21pc2VSZXNvbHZlcnMgPSBbXTtcbiAgfVxuXG4gIGdldCB1cGRhdGVDb3VudGVyKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuI3VwZGF0ZUNvdW50ZXI7XG4gIH1cblxuICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soXG4gICAgX25hbWU6IHN0cmluZyxcbiAgICBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCxcbiAgICBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCxcbiAgICBfbmFtZXNwYWNlPzogc3RyaW5nIHwgbnVsbCxcbiAgKTogdm9pZCB7XG4gICAgLy8gUnVucyB1cGRhdGUgdGFzayB3aGVuIG9ic2VydmVkIGF0dHJpYnV0ZSBoYXMgY2hhbmdlZCBidXQgZG9uJ3QgcnVuIGJlZm9yZSBpbml0aWFsIHVwZGF0ZVxuICAgIGlmICh0aGlzLiN1cGRhdGVDb3VudGVyICYmIG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICAvLyBSdW5zIHVwZGF0ZSB0YXNrIHdoZW4gdGhpcyBFbGVtZW50IGhhcyBjb25uZWN0ZWQgdG8gcGFyZW50IE5vZGVcbiAgICBpZiAodGhpcy4jdXBkYXRlQ291bnRlcikge1xuICAgICAgLy8gUmUtdXBkYXRlLCB0aGlzIEVsZW1lbnQgbWF5IGhhdmUgbW92ZWQgaW50byBhbm90aGVyIHBhcmVudCBOb2RlXG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbml0aWFsIHVwZGF0ZVxuICAgICAgdGhpcy51cGRhdGVTeW5jKCk7XG4gICAgfVxuICB9XG5cbiAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gIH1cblxuICBhZG9wdGVkQ2FsbGJhY2soX29sZERvY3VtZW50OiBEb2N1bWVudCwgX25ld0RvY3VtZW50OiBEb2N1bWVudCk6IHZvaWQge1xuICB9XG5cbiAgdXBkYXRlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFRoaXMgaXMgYW4gYXN5bmNocm9ub3VzIHVwZGF0aW5nIG1ldGhvZCB0aGF0IHNjaGVkdWxlZCB1cGRhdGVzXG4gICAgaWYgKHRoaXMuI3VwZGF0ZVRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZG9tLmdsb2JhbFRoaXMuY2xlYXJUaW1lb3V0KHRoaXMuI3VwZGF0ZVRpbWVySWQpO1xuICAgICAgdGhpcy4jdXBkYXRlVGltZXJJZCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB0aGlzLiN1cGRhdGVUaW1lcklkID0gZG9tLmdsb2JhbFRoaXMuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBkb20uZ2xvYmFsVGhpcy5jbGVhclRpbWVvdXQodGhpcy4jdXBkYXRlVGltZXJJZCk7XG4gICAgICB0aGlzLiN1cGRhdGVUaW1lcklkID0gdW5kZWZpbmVkO1xuXG4gICAgICAvLyBUYWtlIG91dCBQcm9taXNlIHJlc29sdmVycyBvZiB0aGlzIHVwZGF0ZSBwb2ludCBiZWZvcmUgdGhlIHVwZGF0aW5nIHN0YXJ0c1xuICAgICAgY29uc3QgcHJvbWlzZVJlc29sdmVycyA9IHRoaXMuI3VwZGF0ZVByb21pc2VSZXNvbHZlcnMuc3BsaWNlKDApO1xuXG4gICAgICB0aGlzLnVwZGF0ZVN5bmMoKTtcblxuICAgICAgaWYgKHByb21pc2VSZXNvbHZlcnMubGVuZ3RoKSB7XG4gICAgICAgIGZvciAoY29uc3QgcmVzb2x2ZSBvZiBwcm9taXNlUmVzb2x2ZXJzKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgdGhpcy4jdXBkYXRlRGVsYXkpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLiN1cGRhdGVQcm9taXNlUmVzb2x2ZXJzLnB1c2gocmVzb2x2ZSk7XG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVTeW5jKCk6IHZvaWQge1xuICAgIC8vIFRoaXMgaXMgYSBzeW5jaHJvbm91cyB1cGRhdGluZyBtZXRob2QgdGhhdCBjYWxscyBhbiBhZGRpdGlvbmFsIGxpZmVjeWNsZSBjYWxsYmFja3NcbiAgICB0cnkge1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIHRoaXMuI3VwZGF0ZUNvdW50ZXIrKztcbiAgICAgIHRoaXMudXBkYXRlZENhbGxiYWNrKCk7XG4gICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICB0aGlzLmVycm9yQ2FsbGJhY2soZXhjZXB0aW9uKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogdm9pZCB7XG4gIH1cblxuICB1cGRhdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gIH1cblxuICBlcnJvckNhbGxiYWNrKGV4Y2VwdGlvbjogdW5rbm93bik6IHZvaWQge1xuICAgIGNvbnNvbGUuZXJyb3IoZXhjZXB0aW9uKTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxlbWVudEF0dHJpYnV0ZXNQcm94eSB7XG4gIFtrZXk6IHN0cmluZ106IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXQ6IEVsZW1lbnQpIHtcbiAgICAvLyBBdm9pZCBjaXJjdWxhciByZWZlcmVuY2VzXG4gICAgbGV0IHRhcmdldFJlZjogV2Vha1JlZjxFbGVtZW50PiB8IG51bGwgPSBuZXcgV2Vha1JlZih0YXJnZXQpO1xuXG4gICAgY29uc3QgZ2V0VGFyZ2V0ID0gKCkgPT4ge1xuICAgICAgaWYgKHRhcmdldFJlZikge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSB0YXJnZXRSZWYuZGVyZWYoKTtcbiAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0UmVmID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgZWxlbWVudCBub3QgYXZhaWxhYmxlLicpO1xuICAgIH07XG5cbiAgICAvLyBDcmVhdGVzIGNsYXNzIGluc3RhbmNlIGFzIFByb3h5IG9mIE9iamVjdCBzbyBub3QgdGhpcyBjbGFzcyBpbnN0YW5jZVxuICAgIHJldHVybiBuZXcgUHJveHkoe30sIHtcbiAgICAgIHNldDogKF90YXJnZXQsIG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGdldFRhcmdldCgpO1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgZ2V0OiAoX3RhcmdldCwgbmFtZSkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBnZXRUYXJnZXQoKTtcbiAgICAgICAgLy8gUmV0dXJuIHVuZGVmaW5lZCBpbnN0ZWFkIG9mIG51bGwgaWYgYXR0cmlidXRlIGlzIG5vdCBleGlzdFxuICAgICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnICYmIHRhcmdldC5oYXNBdHRyaWJ1dGUobmFtZSkpIHtcbiAgICAgICAgICByZXR1cm4gdGFyZ2V0LmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSxcbiAgICAgIGRlbGV0ZVByb3BlcnR5OiAoX3RhcmdldCwgbmFtZSkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBnZXRUYXJnZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKG5hbWUpKSB7XG4gICAgICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgaGFzOiAoX3RhcmdldCwgbmFtZSkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBnZXRUYXJnZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKG5hbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgIG93bktleXM6ICgpID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZ2V0VGFyZ2V0KCk7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICAgICAgaWYgKHRhcmdldC5oYXNBdHRyaWJ1dGVzKCkpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBBcnJheS5mcm9tKHRhcmdldC5hdHRyaWJ1dGVzKSkge1xuICAgICAgICAgICAga2V5cy5wdXNoKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICB9LFxuICAgICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAoX3RhcmdldCwgbmFtZSkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBnZXRUYXJnZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKG5hbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogdGFyZ2V0LmdldEF0dHJpYnV0ZShuYW1lKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IE5vZGVDb250ZW50RGF0YSwgT25FdmVudEhhbmRsZXIgfSBmcm9tICcuL3R5cGVzLnRzJztcblxuaW1wb3J0IGRvbSBmcm9tICcuL2RvbS50cyc7XG5cbmNvbnN0IGNvbnRhaW5lckNvbGxlY3Rpb24gPSBuZXcgV2Vha1NldCgpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb2RlQ29udGVudDxUIGV4dGVuZHMgTm9kZT4ge1xuICAjY29udGFpbmVyUmVmOiBXZWFrUmVmPFQ+IHwgbnVsbDtcbiAgI2NvbnRleHRSZWY6IFdlYWtSZWY8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHwgbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihjb250YWluZXI6IFQsIGNvbnRleHQ/OiB1bmtub3duKSB7XG4gICAgLy8gQXZvaWQgZWZmZWN0cyBjaGlsZCBub2RlcyBtYW5hZ2VkIGJ5IHRoaXMgZmVhdHVyZVxuICAgIGNvbnRhaW5lckNvbGxlY3Rpb24uYWRkKGNvbnRhaW5lcik7XG5cbiAgICAvLyBBdm9pZCBjaXJjdWxhciByZWZlcmVuY2VzXG4gICAgdGhpcy4jY29udGFpbmVyUmVmID0gbmV3IFdlYWtSZWYoY29udGFpbmVyKTtcbiAgICB0aGlzLiNjb250ZXh0UmVmID0gY29udGV4dCA/IG5ldyBXZWFrUmVmKGNvbnRleHQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pIDogbnVsbDtcbiAgfVxuXG4gIGdldCBjb250YWluZXIoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuI2dldENvbnRhaW5lcigpO1xuICB9XG5cbiAgdXBkYXRlKGNvbnRlbnQ6IE5vZGVDb250ZW50RGF0YSk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuI2dldENvbnRhaW5lcigpO1xuXG4gICAgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBkb20uZ2xvYmFsVGhpcy5Eb2N1bWVudCB8fCBjb250ZW50IGluc3RhbmNlb2YgZG9tLmdsb2JhbFRoaXMuRG9jdW1lbnRGcmFnbWVudCkge1xuICAgICAgdGhpcy4jcGF0Y2hOb2Rlc0luc2lkZU9mKGNvbnRhaW5lciwgY29udGVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuI3BhdGNoTm9kZXNJbnNpZGVPZihjb250YWluZXIsIHRoaXMuI2NyZWF0ZURvY3VtZW50RnJhZ21lbnQoY29udGVudCkpO1xuICAgIH1cblxuICAgIHRoaXMuI2ZpeE9uZXZlbnRIYW5kbGVyc0luc2lkZU9mKGNvbnRhaW5lcik7XG4gIH1cblxuICBjbG9uZSgpOiBEb2N1bWVudEZyYWdtZW50IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLiNnZXRDb250YWluZXIoKTtcblxuICAgIHJldHVybiB0aGlzLiNjcmVhdGVEb2N1bWVudEZyYWdtZW50KGNvbnRhaW5lci5jaGlsZE5vZGVzKTtcbiAgfVxuXG4gICNnZXRDb250YWluZXIoKTogVCB7XG4gICAgaWYgKHRoaXMuI2NvbnRhaW5lclJlZikge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy4jY29udGFpbmVyUmVmLmRlcmVmKCk7XG4gICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiNjb250YWluZXJSZWYgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBub2RlIG5vdCBhdmFpbGFibGUuJyk7XG4gIH1cblxuICAjZ2V0Q29udGV4dCgpOiB1bmtub3duIHtcbiAgICBpZiAodGhpcy4jY29udGV4dFJlZikge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuI2NvbnRleHRSZWYuZGVyZWYoKTtcbiAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBjb250ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4jY29udGV4dFJlZiA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAjY3JlYXRlRG9jdW1lbnRGcmFnbWVudChjb250ZW50OiBOb2RlQ29udGVudERhdGEpOiBEb2N1bWVudEZyYWdtZW50IHtcbiAgICBpZiAodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyAhRE9DVFlQRSwgSFRNTCwgSEVBRCwgQk9EWSB3aWxsIHN0cmlwcGVkIGluc2lkZSBIVE1MVGVtcGxhdGVFbGVtZW50XG4gICAgICBjb25zdCB0ZW1wbGF0ZSA9IGRvbS5nbG9iYWxUaGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgICAgcmV0dXJuIHRlbXBsYXRlLmNvbnRlbnQ7XG4gICAgfVxuXG4gICAgLy8gU29tZSBub2RlIHR5cGVzIGxpa2UgRG9jdW1lbnRUeXBlIHdpbGwgbm90IGluc2VydCBpbnRvIERvY3VtZW50RnJhZ21lbnRcbiAgICAvLyBTaGFkb3dSb290IHdpbGwgbm90IGNsb25lYWJsZSBhbHNvIG5vdCBpbmNsdWRlZCBpbiBOb2RlTGlzdFxuICAgIGNvbnN0IGRvY3VtZW50RnJhZ21lbnQgPSBkb20uZ2xvYmFsVGhpcy5kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBkb20uZ2xvYmFsVGhpcy5Ob2RlKSB7XG4gICAgICBkb2N1bWVudEZyYWdtZW50LmFwcGVuZENoaWxkKGNvbnRlbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgICB9IGVsc2UgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBkb20uZ2xvYmFsVGhpcy5Ob2RlTGlzdCAmJiBjb250ZW50Lmxlbmd0aCkge1xuICAgICAgZm9yIChjb25zdCBub2RlIG9mIEFycmF5LmZyb20oY29udGVudCkpIHtcbiAgICAgICAgZG9jdW1lbnRGcmFnbWVudC5hcHBlbmRDaGlsZChub2RlLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkb2N1bWVudEZyYWdtZW50O1xuICB9XG5cbiAgI3BhdGNoTm9kZXNJbnNpZGVPZihvcmlnaW5hbDogTm9kZSwgZGlmZjogTm9kZSk6IHZvaWQge1xuICAgIGlmIChvcmlnaW5hbC5oYXNDaGlsZE5vZGVzKCkgfHwgZGlmZi5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgIC8vIE5vZGVMaXN0IG9mIE5vZGUuY2hpbGROb2RlcyBpcyBsaXZlIHNvIG11c3QgYmUgY29udmVydCB0byBhcnJheVxuICAgICAgY29uc3Qgb3JpZ2luYWxDaGlsZE5vZGVzID0gQXJyYXkuZnJvbShvcmlnaW5hbC5jaGlsZE5vZGVzKTtcbiAgICAgIGNvbnN0IGRpZmZDaGlsZE5vZGVzID0gQXJyYXkuZnJvbShkaWZmLmNoaWxkTm9kZXMpO1xuICAgICAgY29uc3QgbWF4TGVuZ3RoID0gTWF0aC5tYXgob3JpZ2luYWxDaGlsZE5vZGVzLmxlbmd0aCwgZGlmZkNoaWxkTm9kZXMubGVuZ3RoKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXhMZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLiNwYXRjaE5vZGVzKFxuICAgICAgICAgIG9yaWdpbmFsLFxuICAgICAgICAgIG9yaWdpbmFsQ2hpbGROb2Rlc1tpXSA/PyBudWxsLFxuICAgICAgICAgIGRpZmZDaGlsZE5vZGVzW2ldID8/IG51bGwsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgI3BhdGNoTm9kZXMocGFyZW50OiBOb2RlLCBvcmlnaW5hbDogTm9kZSB8IG51bGwsIGRpZmY6IE5vZGUgfCBudWxsKTogdm9pZCB7XG4gICAgaWYgKG9yaWdpbmFsICYmICFkaWZmKSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQob3JpZ2luYWwpO1xuICAgIH0gZWxzZSBpZiAoIW9yaWdpbmFsICYmIGRpZmYpIHtcbiAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChkaWZmLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgfSBlbHNlIGlmIChvcmlnaW5hbCAmJiBkaWZmKSB7XG4gICAgICBpZiAob3JpZ2luYWwubm9kZVR5cGUgPT09IGRpZmYubm9kZVR5cGUgJiYgb3JpZ2luYWwubm9kZU5hbWUgPT09IGRpZmYubm9kZU5hbWUpIHtcbiAgICAgICAgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgZG9tLmdsb2JhbFRoaXMuRWxlbWVudCAmJiBkaWZmIGluc3RhbmNlb2YgZG9tLmdsb2JhbFRoaXMuRWxlbWVudCkge1xuICAgICAgICAgIC8vIEVsZW1lbnQgaXQncyBIVE1MRWxlbWVudCwgU1ZHRWxlbWVudFxuICAgICAgICAgIHRoaXMuI3BhdGNoQXR0cmlidXRlcyhvcmlnaW5hbCwgZGlmZik7XG4gICAgICAgICAgaWYgKCFjb250YWluZXJDb2xsZWN0aW9uLmhhcyhvcmlnaW5hbCkpIHtcbiAgICAgICAgICAgIHRoaXMuI3BhdGNoTm9kZXNJbnNpZGVPZihvcmlnaW5hbCwgZGlmZik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgZG9tLmdsb2JhbFRoaXMuQ2hhcmFjdGVyRGF0YSAmJiBkaWZmIGluc3RhbmNlb2YgZG9tLmdsb2JhbFRoaXMuQ2hhcmFjdGVyRGF0YSkge1xuICAgICAgICAgIC8vIENoYXJhY3RlckRhdGEgaXQncyBUZXh0LCBDb21tZW50LCBQcm9jZXNzaW5nSW5zdHJ1Y3Rpb25cbiAgICAgICAgICBpZiAob3JpZ2luYWwubm9kZVZhbHVlICE9PSBkaWZmLm5vZGVWYWx1ZSkge1xuICAgICAgICAgICAgb3JpZ2luYWwubm9kZVZhbHVlID0gZGlmZi5ub2RlVmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcmVudC5yZXBsYWNlQ2hpbGQoZGlmZi5jbG9uZU5vZGUodHJ1ZSksIG9yaWdpbmFsKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyZW50LnJlcGxhY2VDaGlsZChkaWZmLmNsb25lTm9kZSh0cnVlKSwgb3JpZ2luYWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICNwYXRjaEF0dHJpYnV0ZXMob3JpZ2luYWw6IEVsZW1lbnQsIGRpZmY6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICAvLyBOYW1lZE5vZGVNYXAgb2YgRWxlbWVudC5hdHRyaWJ1dGVzIGlzIGxpdmUgc28gbXVzdCBiZSBjb252ZXJ0IHRvIGFycmF5XG4gICAgaWYgKG9yaWdpbmFsLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgQXJyYXkuZnJvbShvcmlnaW5hbC5hdHRyaWJ1dGVzKSkge1xuICAgICAgICBpZiAoIWRpZmYuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZS5uYW1lKSkge1xuICAgICAgICAgIG9yaWdpbmFsLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZGlmZi5oYXNBdHRyaWJ1dGVzKCkpIHtcbiAgICAgIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIEFycmF5LmZyb20oZGlmZi5hdHRyaWJ1dGVzKSkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIW9yaWdpbmFsLmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGUubmFtZSkgfHxcbiAgICAgICAgICBvcmlnaW5hbC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlLm5hbWUpICE9PSBhdHRyaWJ1dGUudmFsdWVcbiAgICAgICAgKSB7XG4gICAgICAgICAgb3JpZ2luYWwuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgI2ZpeE9uZXZlbnRIYW5kbGVyc0luc2lkZU9mKHRhcmdldDogTm9kZSk6IHZvaWQge1xuICAgIGlmICh0YXJnZXQuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgQXJyYXkuZnJvbSh0YXJnZXQuY2hpbGROb2RlcykpIHtcbiAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBkb20uZ2xvYmFsVGhpcy5FbGVtZW50KSB7XG4gICAgICAgICAgdGhpcy4jZml4T25ldmVudEhhbmRsZXJzKG5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgI2ZpeE9uZXZlbnRIYW5kbGVycyh0YXJnZXQ6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgLy8gTmFtZWROb2RlTWFwIG9mIEVsZW1lbnQuYXR0cmlidXRlcyBpcyBsaXZlIHNvIG11c3QgYmUgY29udmVydCB0byBhcnJheVxuICAgICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgQXJyYXkuZnJvbSh0YXJnZXQuYXR0cmlidXRlcykpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZS5uYW1lLnNlYXJjaCgvXm9uXFx3Ky9pKSAhPT0gLTEpIHtcbiAgICAgICAgICBjb25zdCBvbmV2ZW50ID0gYXR0cmlidXRlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBjb25zdCBvbmV2ZW50VGFyZ2V0ID0gdGFyZ2V0IGFzIHVua25vd24gYXMgUmVjb3JkPHN0cmluZywgT25FdmVudEhhbmRsZXI+O1xuICAgICAgICAgIGlmIChvbmV2ZW50IGluIHRhcmdldCAmJiB0eXBlb2Ygb25ldmVudFRhcmdldFtvbmV2ZW50XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IG5ldyBGdW5jdGlvbignZXZlbnQnLCBhdHRyaWJ1dGUudmFsdWUpO1xuICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuI2dldENvbnRleHQoKTtcbiAgICAgICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlLm5hbWUpO1xuICAgICAgICAgICAgb25ldmVudFRhcmdldFtvbmV2ZW50XSA9IGhhbmRsZXIuYmluZChjb250ZXh0ID8/IHRhcmdldCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFjb250YWluZXJDb2xsZWN0aW9uLmhhcyh0YXJnZXQpKSB7XG4gICAgICB0aGlzLiNmaXhPbmV2ZW50SGFuZGxlcnNJbnNpZGVPZih0YXJnZXQpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBDb21wb25lbnRDb250ZW50Q29udGFpbmVyLCBOb2RlQ29udGVudERhdGEgfSBmcm9tICcuL3R5cGVzLnRzJztcblxuaW1wb3J0IEN1c3RvbUVsZW1lbnQgZnJvbSAnLi9DdXN0b21FbGVtZW50LnRzJztcbmltcG9ydCBFbGVtZW50QXR0cmlidXRlc1Byb3h5IGZyb20gJy4vRWxlbWVudEF0dHJpYnV0ZXNQcm94eS50cyc7XG5pbXBvcnQgTm9kZUNvbnRlbnQgZnJvbSAnLi9Ob2RlQ29udGVudC50cyc7XG5pbXBvcnQgZG9tIGZyb20gJy4vZG9tLnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcG9uZW50IGV4dGVuZHMgQ3VzdG9tRWxlbWVudCB7XG4gICNhdHRyczogRWxlbWVudEF0dHJpYnV0ZXNQcm94eTtcbiAgI2NvbnRlbnQ6IE5vZGVDb250ZW50PENvbXBvbmVudENvbnRlbnRDb250YWluZXI+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnVwZGF0ZSA9IHRoaXMudXBkYXRlLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLiNhdHRycyA9IG5ldyBFbGVtZW50QXR0cmlidXRlc1Byb3h5KHRoaXMpO1xuICAgIHRoaXMuI2NvbnRlbnQgPSBuZXcgTm9kZUNvbnRlbnQodGhpcy5jcmVhdGVDb250ZW50Q29udGFpbmVyKCksIHRoaXMpO1xuICB9XG5cbiAgZ2V0IGF0dHJzKCk6IEVsZW1lbnRBdHRyaWJ1dGVzUHJveHkge1xuICAgIHJldHVybiB0aGlzLiNhdHRycztcbiAgfVxuXG4gIGdldCBjb250ZW50KCk6IE5vZGVDb250ZW50PENvbXBvbmVudENvbnRlbnRDb250YWluZXI+IHtcbiAgICByZXR1cm4gdGhpcy4jY29udGVudDtcbiAgfVxuXG4gIG9ic2VydmUoLi4uYXJnczogQXJyYXk8dW5rbm93bj4pOiB2b2lkIHtcbiAgICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGZvciAoY29uc3QgYXJnIG9mIGFyZ3MgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KSB7XG4gICAgICAgIGlmIChhcmcuc3Vic2NyaWJlICYmIHR5cGVvZiBhcmcuc3Vic2NyaWJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgYXJnLnN1YnNjcmliZSh0aGlzLnVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1bm9ic2VydmUoLi4uYXJnczogQXJyYXk8dW5rbm93bj4pOiB2b2lkIHtcbiAgICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGZvciAoY29uc3QgYXJnIG9mIGFyZ3MgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KSB7XG4gICAgICAgIGlmIChhcmcudW5zdWJzY3JpYmUgJiYgdHlwZW9mIGFyZy51bnN1YnNjcmliZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGFyZy51bnN1YnNjcmliZSh0aGlzLnVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkaXNwYXRjaCh0eXBlOiBzdHJpbmcsIGRldGFpbD86IHVua25vd24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy4jY29udGVudC5jb250YWluZXIuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBkb20uZ2xvYmFsVGhpcy5DdXN0b21FdmVudCh0eXBlLCB7XG4gICAgICAgIGRldGFpbDogZGV0YWlsLFxuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBjcmVhdGVDb250ZW50Q29udGFpbmVyKCk6IENvbXBvbmVudENvbnRlbnRDb250YWluZXIge1xuICAgIHJldHVybiB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcbiAgfVxuXG4gIG92ZXJyaWRlIHJlbmRlcigpOiB2b2lkIHtcbiAgICB0aGlzLiNjb250ZW50LnVwZGF0ZSh0aGlzLnRlbXBsYXRlKCkpO1xuICB9XG5cbiAgdGVtcGxhdGUoKTogTm9kZUNvbnRlbnREYXRhIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgT2JzZXJ2ZXIgfSBmcm9tICcuL3R5cGVzLnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2JzZXJ2YWJsZTxUID0gdW5rbm93bj4ge1xuICAjb2JzZXJ2ZXJDb2xsZWN0aW9uOiBTZXQ8T2JzZXJ2ZXI8VD4+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuI29ic2VydmVyQ29sbGVjdGlvbiA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIHN1YnNjcmliZShvYnNlcnZlcjogT2JzZXJ2ZXI8VD4pOiB2b2lkIHtcbiAgICB0aGlzLiNvYnNlcnZlckNvbGxlY3Rpb24uYWRkKG9ic2VydmVyKTtcbiAgfVxuXG4gIHVuc3Vic2NyaWJlKG9ic2VydmVyOiBPYnNlcnZlcjxUPik6IHZvaWQge1xuICAgIHRoaXMuI29ic2VydmVyQ29sbGVjdGlvbi5kZWxldGUob2JzZXJ2ZXIpO1xuICB9XG5cbiAgbm90aWZ5KHZhbHVlOiBUKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuI29ic2VydmVyQ29sbGVjdGlvbi5zaXplKSB7XG4gICAgICBmb3IgKGNvbnN0IG9ic2VydmVyIG9mIHRoaXMuI29ic2VydmVyQ29sbGVjdGlvbikge1xuICAgICAgICBvYnNlcnZlcih2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgT2JzZXJ2YWJsZSBmcm9tICcuL09ic2VydmFibGUudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYnNlcnZhYmxlVmFsdWU8VD4gZXh0ZW5kcyBPYnNlcnZhYmxlPFQ+IHtcbiAgI3ZhbHVlOiBUO1xuXG4gIGNvbnN0cnVjdG9yKHZhbHVlOiBUKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuI3ZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBzZXQodmFsdWU6IFQpOiB2b2lkIHtcbiAgICB0aGlzLiN2YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMubm90aWZ5KCk7XG4gIH1cblxuICBnZXQoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuI3ZhbHVlO1xuICB9XG5cbiAgb3ZlcnJpZGUgbm90aWZ5KCk6IHZvaWQge1xuICAgIHN1cGVyLm5vdGlmeSh0aGlzLiN2YWx1ZSk7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgT25FcnJvckhhbmRsZXIsIE9uRXZlbnRIYW5kbGVyLCBSb3V0ZUhhbmRsZXIsIFJvdXRlck1vZGUgfSBmcm9tICcuL3R5cGVzLnRzJztcblxuaW1wb3J0IGRvbSBmcm9tICcuL2RvbS50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvdXRlciB7XG4gICNtb2RlOiBSb3V0ZXJNb2RlO1xuICAjYmFzZTogc3RyaW5nO1xuICAjb25jaGFuZ2U6IE9uRXZlbnRIYW5kbGVyO1xuICAjb25lcnJvcjogT25FcnJvckhhbmRsZXI7XG5cbiAgI3JvdXRlQ29sbGVjdGlvbjogTWFwPHN0cmluZywgUm91dGVIYW5kbGVyPjtcbiAgI2hhc2hjaGFuZ2VDYWxsYmFjazogeyAoZXZlbnQ6IEhhc2hDaGFuZ2VFdmVudCk6IHZvaWQgfTtcbiAgI3BvcHN0YXRlQ2FsbGJhY2s6IHsgKGV2ZW50OiBQb3BTdGF0ZUV2ZW50KTogdm9pZCB9O1xuXG4gIGNvbnN0cnVjdG9yKG1vZGU6IFJvdXRlck1vZGUsIGJhc2U6IHN0cmluZyA9ICcnKSB7XG4gICAgaWYgKG1vZGUgIT09ICdoYXNoJyAmJiBtb2RlICE9PSAnaGlzdG9yeScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIG1vZGUgbXVzdCBiZSBzZXQgXCJoYXNoXCIgb3IgXCJoaXN0b3J5XCIuJyk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG1vZGUgaXMgJ2hhc2gnLFxuICAgIC8vIHRoZSBiYXNlIHNob3VsZCBiZSB0aGUgYmFzZSBwYXRoIHBhcnQgb2YgdGhlIHBhdGggcmVwcmVzZW50ZWQgd2l0aCBVUkwgZnJhZ21lbnRcbiAgICB0aGlzLiNtb2RlID0gbW9kZTtcbiAgICB0aGlzLiNiYXNlID0gKGJhc2UgJiYgIWJhc2UuZW5kc1dpdGgoJy8nKSkgPyBiYXNlICsgJy8nIDogYmFzZTtcbiAgICB0aGlzLiNvbmNoYW5nZSA9ICgpID0+IHt9O1xuICAgIHRoaXMuI29uZXJyb3IgPSAoZXhjZXB0aW9uKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKGV4Y2VwdGlvbik7XG4gICAgfTtcblxuICAgIHRoaXMuI3JvdXRlQ29sbGVjdGlvbiA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLiNoYXNoY2hhbmdlQ2FsbGJhY2sgPSB0aGlzLiNoYW5kbGVIYXNoY2hhbmdlLmJpbmQodGhpcyk7XG4gICAgdGhpcy4jcG9wc3RhdGVDYWxsYmFjayA9IHRoaXMuI2hhbmRsZVBvcHN0YXRlLmJpbmQodGhpcyk7XG4gIH1cblxuICBnZXQgbW9kZSgpOiBSb3V0ZXJNb2RlIHtcbiAgICByZXR1cm4gdGhpcy4jbW9kZTtcbiAgfVxuXG4gIGdldCBiYXNlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI2Jhc2U7XG4gIH1cblxuICAvLyBkZW5vLWxpbnQtaWdub3JlIGV4cGxpY2l0LW1vZHVsZS1ib3VuZGFyeS10eXBlc1xuICBzZXQgb25jaGFuZ2UoaGFuZGxlcjogT25FdmVudEhhbmRsZXIpIHtcbiAgICB0aGlzLiNvbmNoYW5nZSA9IGhhbmRsZXI7XG4gIH1cblxuICBnZXQgb25jaGFuZ2UoKTogT25FdmVudEhhbmRsZXIge1xuICAgIHJldHVybiB0aGlzLiNvbmNoYW5nZTtcbiAgfVxuXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgZXhwbGljaXQtbW9kdWxlLWJvdW5kYXJ5LXR5cGVzXG4gIHNldCBvbmVycm9yKGhhbmRsZXI6IE9uRXJyb3JIYW5kbGVyKSB7XG4gICAgdGhpcy4jb25lcnJvciA9IGhhbmRsZXI7XG4gIH1cblxuICBnZXQgb25lcnJvcigpOiBPbkVycm9ySGFuZGxlciB7XG4gICAgcmV0dXJuIHRoaXMuI29uZXJyb3I7XG4gIH1cblxuICBzZXQocGF0dGVybjogc3RyaW5nLCBoYW5kbGVyOiBSb3V0ZUhhbmRsZXIpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuI3JvdXRlQ29sbGVjdGlvbi5zaXplKSB7XG4gICAgICBpZiAodGhpcy4jbW9kZSA9PT0gJ2hhc2gnKSB7XG4gICAgICAgIGRvbS5nbG9iYWxUaGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCB0aGlzLiNoYXNoY2hhbmdlQ2FsbGJhY2spO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLiNtb2RlID09PSAnaGlzdG9yeScpIHtcbiAgICAgICAgZG9tLmdsb2JhbFRoaXMuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCB0aGlzLiNwb3BzdGF0ZUNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLiNyb3V0ZUNvbGxlY3Rpb24uc2V0KHRoaXMuI2ZpeFJvdXRlUGF0dGVybihwYXR0ZXJuKSwgaGFuZGxlcik7XG4gIH1cblxuICBkZWxldGUocGF0dGVybjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy4jcm91dGVDb2xsZWN0aW9uLmRlbGV0ZSh0aGlzLiNmaXhSb3V0ZVBhdHRlcm4ocGF0dGVybikpO1xuXG4gICAgaWYgKCF0aGlzLiNyb3V0ZUNvbGxlY3Rpb24uc2l6ZSkge1xuICAgICAgaWYgKHRoaXMuI21vZGUgPT09ICdoYXNoJykge1xuICAgICAgICBkb20uZ2xvYmFsVGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgdGhpcy4jaGFzaGNoYW5nZUNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy4jbW9kZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICAgIGRvbS5nbG9iYWxUaGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy4jcG9wc3RhdGVDYWxsYmFjayk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmF2aWdhdGUodXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy4jbW9kZSA9PT0gJ2hhc2gnKSB7XG4gICAgICB0aGlzLiNuYXZpZ2F0ZVdpdGhIYXNoTW9kZSh1cmwpO1xuICAgIH0gZWxzZSBpZiAodGhpcy4jbW9kZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICB0aGlzLiNuYXZpZ2F0ZVdpdGhIaXN0b3J5TW9kZSh1cmwpO1xuICAgIH1cbiAgfVxuXG4gICNuYXZpZ2F0ZVdpdGhIYXNoTW9kZSh1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGxldCBuZXdWaXJ0dWFsUGF0aCA9ICcnO1xuXG4gICAgaWYgKHVybC5zZWFyY2goL15odHRwcz86XFwvXFwvfFxcP3wjL2kpICE9PSAtMSkge1xuICAgICAgY29uc3QgbmV3VXJsID0gbmV3IGRvbS5nbG9iYWxUaGlzLlVSTCh1cmwsIGRvbS5nbG9iYWxUaGlzLmxvY2F0aW9uLmhyZWYpO1xuICAgICAgY29uc3QgbmV3VXJsUGFydHMgPSBuZXdVcmwuaHJlZi5zcGxpdCgnIycpO1xuICAgICAgY29uc3Qgb2xkVXJsUGFydHMgPSBkb20uZ2xvYmFsVGhpcy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJyk7XG5cbiAgICAgIGlmIChuZXdVcmxQYXJ0c1swXSAhPT0gb2xkVXJsUGFydHNbMF0pIHtcbiAgICAgICAgZG9tLmdsb2JhbFRoaXMubG9jYXRpb24uaHJlZiA9IG5ld1VybC5ocmVmO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG5ld1ZpcnR1YWxQYXRoID0gbmV3VXJsUGFydHNbMV0gPz8gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1ZpcnR1YWxQYXRoID0gdXJsO1xuICAgIH1cblxuICAgIGNvbnN0IG9sZFZpcnR1YWxQYXRoID0gZG9tLmdsb2JhbFRoaXMubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSk7XG4gICAgY29uc3Qgb2xkVmlydHVhbFVybCA9IG5ldyBkb20uZ2xvYmFsVGhpcy5VUkwob2xkVmlydHVhbFBhdGgsIGRvbS5nbG9iYWxUaGlzLmxvY2F0aW9uLm9yaWdpbik7XG4gICAgY29uc3QgbmV3VmlydHVhbFVybCA9IG5ldyBkb20uZ2xvYmFsVGhpcy5VUkwodGhpcy4jcmVzb2x2ZUJhc2VVcmwobmV3VmlydHVhbFBhdGgpLCBvbGRWaXJ0dWFsVXJsLmhyZWYpO1xuXG4gICAgaWYgKG5ld1ZpcnR1YWxVcmwucGF0aG5hbWUgIT09IG9sZFZpcnR1YWxQYXRoKSB7XG4gICAgICBkb20uZ2xvYmFsVGhpcy5sb2NhdGlvbi5oYXNoID0gbmV3VmlydHVhbFVybC5wYXRobmFtZTtcbiAgICAgIC8vIFRoZW4gaGFzaGNoYW5nZSBldmVudCB3aWxsIGZpcmVcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBKdXN0IGludm9rZSByb3V0ZSBoYW5kbGVyIGlmIG5vIFVSTCBjaGFuZ2VkXG4gICAgdGhpcy4jaW52b2tlUm91dGVIYW5kbGVyKG5ld1ZpcnR1YWxVcmwucGF0aG5hbWUpO1xuICB9XG5cbiAgI25hdmlnYXRlV2l0aEhpc3RvcnlNb2RlKHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbmV3VXJsID0gbmV3IGRvbS5nbG9iYWxUaGlzLlVSTCh0aGlzLiNyZXNvbHZlQmFzZVVybCh1cmwpLCBkb20uZ2xvYmFsVGhpcy5sb2NhdGlvbi5ocmVmKTtcblxuICAgIGlmIChuZXdVcmwub3JpZ2luICE9PSBkb20uZ2xvYmFsVGhpcy5sb2NhdGlvbi5vcmlnaW4pIHtcbiAgICAgIGRvbS5nbG9iYWxUaGlzLmxvY2F0aW9uLmhyZWYgPSBuZXdVcmwuaHJlZjtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2VzIFVSTCBzdGF0ZSBhbmQgaW52b2tlIHJvdXRlIGhhbmRsZXJcbiAgICBpZiAobmV3VXJsLmhyZWYgIT09IGRvbS5nbG9iYWxUaGlzLmxvY2F0aW9uLmhyZWYpIHtcbiAgICAgIGRvbS5nbG9iYWxUaGlzLmhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgbmV3VXJsLmhyZWYpO1xuICAgICAgdGhpcy4jb25jaGFuZ2UobmV3IGRvbS5nbG9iYWxUaGlzLkN1c3RvbUV2ZW50KCdwdXNoc3RhdGUnKSk7XG4gICAgfVxuXG4gICAgdGhpcy4jaW52b2tlUm91dGVIYW5kbGVyKG5ld1VybC5wYXRobmFtZSk7XG4gIH1cblxuICAjaGFuZGxlSGFzaGNoYW5nZShldmVudDogSGFzaENoYW5nZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy4jb25jaGFuZ2UoZXZlbnQpO1xuICAgIHRoaXMuI2ludm9rZVJvdXRlSGFuZGxlcihkb20uZ2xvYmFsVGhpcy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSk7XG4gIH1cblxuICAjaGFuZGxlUG9wc3RhdGUoZXZlbnQ6IFBvcFN0YXRlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLiNvbmNoYW5nZShldmVudCk7XG4gICAgdGhpcy4jaW52b2tlUm91dGVIYW5kbGVyKGRvbS5nbG9iYWxUaGlzLmxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgfVxuXG4gICNpbnZva2VSb3V0ZUhhbmRsZXIocGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLiNyb3V0ZUNvbGxlY3Rpb24uc2l6ZSkge1xuICAgICAgICBmb3IgKGNvbnN0IFtwYXR0ZXJuLCBoYW5kbGVyXSBvZiB0aGlzLiNyb3V0ZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgICBjb25zdCBtYXRjaGVzID0gcGF0aC5tYXRjaChuZXcgUmVnRXhwKHBhdHRlcm4pKTtcbiAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgaGFuZGxlcihtYXRjaGVzLmdyb3VwcyA/PyB7fSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgIHRoaXMuI29uZXJyb3IoZXhjZXB0aW9uKTtcbiAgICB9XG4gIH1cblxuICAjcmVzb2x2ZUJhc2VVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy4jYmFzZSAmJiB1cmwuc2VhcmNoKC9eKGh0dHBzPzpcXC9cXC98XFwvKS9pKSA9PT0gLTEpID8gdGhpcy4jYmFzZSArIHVybCA6IHVybDtcbiAgfVxuXG4gICNmaXhSb3V0ZVBhdHRlcm4ocGF0dGVybjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBSZXBsYWNlIDpuYW1lIHRvICg/PG5hbWU+W14vPyNdKykgYnV0IGRvbid0IHJlcGxhY2UgaWYgaXQncyBhIHBhcnQgb2Ygbm9uLWNhcHR1cmluZyBncm91cHMgKD86cGF0dGVybilcbiAgICAvLyBUaGUgcGF0dGVybiBtYXkgc3RhcnQgd2l0aCBcIjpcIiBzbyBwcmVmaXggdGhlIHBhdHRlcm4gd2l0aCBcIi9cIiBhbmQgcmVtb3ZlIGl0IHdoZW4gdGhlIHJlcGxhY2VtZW50IGNvbXBsZXRlXG4gICAgcmV0dXJuIGAvJHtwYXR0ZXJufWAucmVwbGFjZSgvKFteP10pOihcXHcrKS9nLCAnJDEoPzwkMj5bXi8/I10rKScpLnN1YnN0cmluZygxKTtcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBXZWJTdG9yYWdlTW9kZSB9IGZyb20gJy4vdHlwZXMudHMnO1xuXG5pbXBvcnQgZG9tIGZyb20gJy4vZG9tLnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2ViU3RvcmFnZSB7XG4gICNtb2RlOiBXZWJTdG9yYWdlTW9kZTtcbiAgI3ByZWZpeDogc3RyaW5nO1xuXG4gICNzdG9yYWdlOiBTdG9yYWdlO1xuXG4gIGNvbnN0cnVjdG9yKG1vZGU6IFdlYlN0b3JhZ2VNb2RlLCBwcmVmaXg6IHN0cmluZyA9ICcnKSB7XG4gICAgdGhpcy4jbW9kZSA9IG1vZGU7XG4gICAgdGhpcy4jcHJlZml4ID0gcHJlZml4O1xuXG4gICAgc3dpdGNoICh0aGlzLiNtb2RlKSB7XG4gICAgICBjYXNlICdsb2NhbCc6IHtcbiAgICAgICAgdGhpcy4jc3RvcmFnZSA9IGRvbS5nbG9iYWxUaGlzLmxvY2FsU3RvcmFnZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdzZXNzaW9uJzoge1xuICAgICAgICB0aGlzLiNzdG9yYWdlID0gZG9tLmdsb2JhbFRoaXMuc2Vzc2lvblN0b3JhZ2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBtb2RlIG11c3QgYmUgc2V0IFwibG9jYWxcIiBvciBcInNlc3Npb25cIi4nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQgbW9kZSgpOiBXZWJTdG9yYWdlTW9kZSB7XG4gICAgcmV0dXJuIHRoaXMuI21vZGU7XG4gIH1cblxuICBnZXQgcHJlZml4KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI3ByZWZpeDtcbiAgfVxuXG4gIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuI3N0b3JhZ2UubGVuZ3RoO1xuICB9XG5cbiAga2V5cygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICBjb25zdCBrZXlzOiBBcnJheTxzdHJpbmc+ID0gW107XG4gICAgaWYgKHRoaXMuI3N0b3JhZ2UubGVuZ3RoKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuI3N0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAga2V5cy5wdXNoKHRoaXMuI3N0b3JhZ2Uua2V5KGkpIGFzIHN0cmluZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xuICB9XG5cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIC8vIEFkZHMgcHJlZml4IHRvIHRoZSBrZXlcbiAgICAvLyBhbmQgbWFrZXMgdGhlIHZhbHVlIGludG8gc3BlY2lhbCBvYmplY3QgYW5kIHNlcmlhbGlzZSB0byBKU09OXG4gICAgdGhpcy4jc3RvcmFnZS5zZXRJdGVtKFxuICAgICAgdGhpcy4jcHJlZml4ICsga2V5LFxuICAgICAgSlNPTi5zdHJpbmdpZnkoeyBfazoga2V5LCBfdjogdmFsdWUgfSksXG4gICAgKTtcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IHVua25vd24ge1xuICAgIC8vIENoZWNrcyBpZiB0aGUgdmFsdWUgaXMgSlNPTiBjcmVhdGVkIGZyb20gc3BlY2lhbCBvYmplY3QgYW5kIHJldHVybnMgb3JpZ2luYWwgdmFsdWVcbiAgICAvLyBvdGhlcndpc2UganVzdCByZXR1cm5zIHRoZSB2YWx1ZVxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy4jc3RvcmFnZS5nZXRJdGVtKHRoaXMuI3ByZWZpeCArIGtleSk7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBKU09OLnBhcnNlKCkgd2lsbCB0aHJvdyBhIHBhcnNlIGVycm9yIGlmIHRoZSB2YWx1ZSBpcyBub3QgdmFsaWQgSlNPTlxuICAgICAgICBjb25zdCBkZXNlcmlhbGl6ZWRWYWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICBpZiAoZGVzZXJpYWxpemVkVmFsdWU/Ll9rID09PSBrZXkpIHtcbiAgICAgICAgICAvLyBXaWxsIHJldHVybiBvcmlnaW5hbCB2YWx1ZSBvciB1bmRlZmluZWRcbiAgICAgICAgICByZXR1cm4gZGVzZXJpYWxpemVkVmFsdWUuX3Y7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBXaWxsIHJldHVybiBzdHJpbmdcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBXaWxsIHJldHVybiBzdHJpbmcgb3IgbnVsbFxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGRlbGV0ZShrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuI3N0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLiNwcmVmaXggKyBrZXkpO1xuICB9XG5cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy4jc3RvcmFnZS5jbGVhcigpO1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IENyZWF0ZUNvbXBvbmVudE9wdGlvbnMsIE5vZGVDb250ZW50RGF0YSB9IGZyb20gJy4vdHlwZXMudHMnO1xuXG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vQ29tcG9uZW50LnRzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50PFQgPSBDb21wb25lbnQ+KG5hbWU6IHN0cmluZywgb3B0aW9ucz86IENyZWF0ZUNvbXBvbmVudE9wdGlvbnM8VD4pOiBUIHtcbiAgY29uc3QgQ3VzdG9tQ29tcG9uZW50ID0gY2xhc3MgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHN0YXRpYyBvdmVycmlkZSBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCk6IEFycmF5PHN0cmluZz4ge1xuICAgICAgcmV0dXJuIChvcHRpb25zPy5vYnNlcnZlZEF0dHJpYnV0ZXMgJiYgQXJyYXkuaXNBcnJheShvcHRpb25zLm9ic2VydmVkQXR0cmlidXRlcykpXG4gICAgICAgID8gb3B0aW9ucy5vYnNlcnZlZEF0dHJpYnV0ZXNcbiAgICAgICAgOiBzdXBlci5vYnNlcnZlZEF0dHJpYnV0ZXM7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICBzdXBlcigpO1xuXG4gICAgICBpZiAob3B0aW9ucz8uaW5pdCAmJiB0eXBlb2Ygb3B0aW9ucy5pbml0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9wdGlvbnMuaW5pdCh0aGlzIGFzIHVua25vd24gYXMgVCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICBpZiAob3B0aW9ucz8uY29ubmVjdGVkICYmIHR5cGVvZiBvcHRpb25zLmNvbm5lY3RlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvcHRpb25zLmNvbm5lY3RlZCh0aGlzIGFzIHVua25vd24gYXMgVCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgZGlzY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgICBpZiAob3B0aW9ucz8uZGlzY29ubmVjdGVkICYmIHR5cGVvZiBvcHRpb25zLmRpc2Nvbm5lY3RlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvcHRpb25zLmRpc2Nvbm5lY3RlZCh0aGlzIGFzIHVua25vd24gYXMgVCk7XG4gICAgICB9XG5cbiAgICAgIHN1cGVyLmRpc2Nvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgdGVtcGxhdGUoKTogTm9kZUNvbnRlbnREYXRhIHtcbiAgICAgIHJldHVybiAob3B0aW9ucz8udGVtcGxhdGUgJiYgdHlwZW9mIG9wdGlvbnMudGVtcGxhdGUgPT09ICdmdW5jdGlvbicpXG4gICAgICAgID8gb3B0aW9ucy50ZW1wbGF0ZSh0aGlzIGFzIHVua25vd24gYXMgVClcbiAgICAgICAgOiBzdXBlci50ZW1wbGF0ZSgpO1xuICAgIH1cbiAgfTtcblxuICBDdXN0b21Db21wb25lbnQuZGVmaW5lKG5hbWUpO1xuXG4gIHJldHVybiBDdXN0b21Db21wb25lbnQgYXMgVDtcbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vc3JjL3R5cGVzLnRzJztcblxuZXhwb3J0ICogZnJvbSAnLi92ZXJzaW9uLnRzJztcblxuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb21wb25lbnQgfSBmcm9tICcuL3NyYy9Db21wb25lbnQudHMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBDdXN0b21FbGVtZW50IH0gZnJvbSAnLi9zcmMvQ3VzdG9tRWxlbWVudC50cyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEVsZW1lbnRBdHRyaWJ1dGVzUHJveHkgfSBmcm9tICcuL3NyYy9FbGVtZW50QXR0cmlidXRlc1Byb3h5LnRzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTm9kZUNvbnRlbnQgfSBmcm9tICcuL3NyYy9Ob2RlQ29udGVudC50cyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIE9ic2VydmFibGUgfSBmcm9tICcuL3NyYy9PYnNlcnZhYmxlLnRzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgT2JzZXJ2YWJsZVZhbHVlIH0gZnJvbSAnLi9zcmMvT2JzZXJ2YWJsZVZhbHVlLnRzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUm91dGVyIH0gZnJvbSAnLi9zcmMvUm91dGVyLnRzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgV2ViU3RvcmFnZSB9IGZyb20gJy4vc3JjL1dlYlN0b3JhZ2UudHMnO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIGNyZWF0ZUNvbXBvbmVudCB9IGZyb20gJy4vc3JjL2NyZWF0ZUNvbXBv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
