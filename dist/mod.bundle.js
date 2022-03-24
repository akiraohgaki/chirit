// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class CustomElement extends HTMLElement {
    _updatedCount;
    _updateTimerId;
    _updateDelay;
    _updatePromiseResolvers;
    constructor(){
        super();
        this._updatedCount = 0;
        this._updateTimerId = undefined;
        this._updateDelay = 100;
        this._updatePromiseResolvers = [];
    }
    static get observedAttributes() {
        return [];
    }
    attributeChangedCallback(_name, oldValue, newValue, _namespace) {
        if (this._updatedCount && oldValue !== newValue) {
            this.update();
        }
    }
    connectedCallback() {
        if (this._updatedCount) {
            this.update();
        } else {
            this.updateSync();
        }
    }
    disconnectedCallback() {}
    adoptedCallback(_oldDocument, _newDocument) {}
    static define(name, options) {
        globalThis.customElements.define(name, this, options);
    }
    get updatedCount() {
        return this._updatedCount;
    }
    update() {
        if (this._updateTimerId !== undefined) {
            globalThis.clearTimeout(this._updateTimerId);
            this._updateTimerId = undefined;
        }
        this._updateTimerId = globalThis.setTimeout(()=>{
            globalThis.clearTimeout(this._updateTimerId);
            this._updateTimerId = undefined;
            const promiseResolvers = this._updatePromiseResolvers.splice(0);
            this.updateSync();
            if (promiseResolvers.length) {
                for (const resolve of promiseResolvers){
                    resolve();
                }
            }
        }, this._updateDelay);
        return new Promise((resolve)=>{
            this._updatePromiseResolvers.push(resolve);
        });
    }
    updateSync() {
        try {
            this.render();
            this._updatedCount++;
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
        return new Proxy({}, {
            set: (_target, name, value)=>{
                if (typeof name === 'string' && typeof value === 'string') {
                    target.setAttribute(name, value);
                    return true;
                }
                return false;
            },
            get: (_target, name)=>{
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    return target.getAttribute(name);
                }
                return undefined;
            },
            deleteProperty: (_target, name)=>{
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    target.removeAttribute(name);
                    return true;
                }
                return false;
            },
            has: (_target, name)=>{
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    return true;
                }
                return false;
            },
            ownKeys: ()=>{
                const keys = [];
                if (target.hasAttributes()) {
                    for (const attribute of Array.from(target.attributes)){
                        keys.push(attribute.name);
                    }
                }
                return keys;
            },
            getOwnPropertyDescriptor: (_target, name)=>{
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
    _container;
    _context;
    constructor(container, context){
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
        } else {
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
        } else if (content instanceof NodeList && content.length) {
            for (const node of Array.from(content)){
                documentFragment.appendChild(node.cloneNode(true));
            }
        }
        return documentFragment;
    }
    _patchNodesInsideOf(original, diff) {
        if (original.hasChildNodes() || diff.hasChildNodes()) {
            const originalChildNodes = Array.from(original.childNodes);
            const diffChildNodes = Array.from(diff.childNodes);
            const maxLength = Math.max(originalChildNodes.length, diffChildNodes.length);
            for(let i = 0; i < maxLength; i++){
                this._patchNodes(original, originalChildNodes[i] ?? null, diffChildNodes[i] ?? null);
            }
        }
    }
    _patchNodes(parent, original, diff) {
        if (original && !diff) {
            parent.removeChild(original);
        } else if (!original && diff) {
            parent.appendChild(diff.cloneNode(true));
        } else if (original && diff) {
            if (original.nodeType === diff.nodeType && original.nodeName === diff.nodeName) {
                if (original instanceof Element && diff instanceof Element) {
                    this._patchAttributes(original, diff);
                    if (!containerCollection.has(original)) {
                        this._patchNodesInsideOf(original, diff);
                    }
                } else if (original instanceof CharacterData && diff instanceof CharacterData) {
                    if (original.nodeValue !== diff.nodeValue) {
                        original.nodeValue = diff.nodeValue;
                    }
                } else {
                    parent.replaceChild(diff.cloneNode(true), original);
                }
            } else {
                parent.replaceChild(diff.cloneNode(true), original);
            }
        }
    }
    _patchAttributes(original, diff) {
        if (original.hasAttributes()) {
            for (const attribute of Array.from(original.attributes)){
                if (!diff.hasAttribute(attribute.name)) {
                    original.removeAttribute(attribute.name);
                }
            }
        }
        if (diff.hasAttributes()) {
            for (const attribute of Array.from(diff.attributes)){
                if (!original.hasAttribute(attribute.name) || original.getAttribute(attribute.name) !== attribute.value) {
                    original.setAttribute(attribute.name, attribute.value);
                }
            }
        }
    }
    _fixOneventHandlersInsideOf(target) {
        if (target.hasChildNodes()) {
            for (const node of Array.from(target.childNodes)){
                if (node instanceof Element) {
                    this._fixOneventHandlers(node);
                }
            }
        }
    }
    _fixOneventHandlers(target) {
        if (target.hasAttributes()) {
            for (const attribute of Array.from(target.attributes)){
                if (attribute.name.search(/^on\w+/i) !== -1) {
                    const onevent = attribute.name.toLowerCase();
                    const oneventTarget = target;
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
class Component extends CustomElement {
    _attrs;
    _content;
    constructor(){
        super();
        this._attrs = new ElementAttributesProxy(this);
        this._content = new NodeContent(this.createContentContainer(), this);
    }
    get attrs() {
        return this._attrs;
    }
    get content() {
        return this._content;
    }
    dispatch(type, detail) {
        return this._content.container.dispatchEvent(new CustomEvent(type, {
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
        this._content.update(this.template());
    }
    template() {
        return '';
    }
}
class Observable {
    _observerCollection;
    constructor(){
        this._observerCollection = new Set();
    }
    subscribe(observer) {
        this._observerCollection.add(observer);
    }
    unsubscribe(observer) {
        this._observerCollection.delete(observer);
    }
    notify(value) {
        if (this._observerCollection.size) {
            for (const observer of this._observerCollection){
                observer(value);
            }
        }
    }
}
class ObservableValue extends Observable {
    _value;
    constructor(value){
        super();
        this._value = value;
    }
    set(value) {
        this._value = value;
        this.notify();
    }
    get() {
        return this._value;
    }
    notify() {
        super.notify(this._value);
    }
}
let isRegExpNamedCaptureGroupsAvailable = false;
try {
    const matches = 'Named capture groups'.match(/(?<name>.+)/);
    isRegExpNamedCaptureGroupsAvailable = matches?.groups?.name ? true : false;
} catch  {
    isRegExpNamedCaptureGroupsAvailable = false;
}
class Router {
    _mode;
    _base;
    _onchange;
    _onerror;
    _routeCollection;
    constructor(mode, base = ''){
        if (mode !== 'hash' && mode !== 'history') {
            throw new Error('The mode must be set "hash" or "history".');
        }
        this._mode = mode;
        this._base = base && !base.endsWith('/') ? base + '/' : base;
        this._onchange = ()=>{};
        this._onerror = (exception)=>{
            console.error(exception);
        };
        this._routeCollection = new Map();
        this._handleHashchange = this._handleHashchange.bind(this);
        this._handlePopstate = this._handlePopstate.bind(this);
    }
    get mode() {
        return this._mode;
    }
    get base() {
        return this._base;
    }
    set onchange(handler) {
        this._onchange = handler;
    }
    get onchange() {
        return this._onchange;
    }
    set onerror(handler) {
        this._onerror = handler;
    }
    get onerror() {
        return this._onerror;
    }
    setRoute(pattern, handler) {
        if (!this._routeCollection.size) {
            if (this._mode === 'hash') {
                globalThis.addEventListener('hashchange', this._handleHashchange);
            } else if (this._mode === 'history') {
                globalThis.addEventListener('popstate', this._handlePopstate);
            }
        }
        this._routeCollection.set(this._fixRoutePattern(pattern), handler);
    }
    removeRoute(pattern) {
        this._routeCollection.delete(this._fixRoutePattern(pattern));
        if (!this._routeCollection.size) {
            if (this._mode === 'hash') {
                globalThis.removeEventListener('hashchange', this._handleHashchange);
            } else if (this._mode === 'history') {
                globalThis.removeEventListener('popstate', this._handlePopstate);
            }
        }
    }
    navigate(url) {
        if (this._mode === 'hash') {
            this._navigateWithHashMode(url);
        } else if (this._mode === 'history') {
            this._navigateWithHistoryMode(url);
        }
    }
    _navigateWithHashMode(url) {
        let newVirtualPath = '';
        if (url.search(/^https?:\/\/|\?|#/i) !== -1) {
            const newUrl = new URL(url, globalThis.location.href);
            const newUrlParts = newUrl.href.split('#');
            const oldUrlParts = globalThis.location.href.split('#');
            if (newUrlParts[0] !== oldUrlParts[0]) {
                globalThis.location.href = newUrl.href;
                return;
            }
            newVirtualPath = newUrlParts[1] ?? '';
        } else {
            newVirtualPath = url;
        }
        const oldVirtualPath = globalThis.location.hash.substring(1);
        const oldVirtualUrl = new URL(oldVirtualPath, globalThis.location.origin);
        const newVirtualUrl = new URL(this._resolveBaseUrl(newVirtualPath), oldVirtualUrl.href);
        if (newVirtualUrl.pathname !== oldVirtualPath) {
            globalThis.location.hash = newVirtualUrl.pathname;
            return;
        }
        this._invokeRouteHandler(newVirtualUrl.pathname);
    }
    _navigateWithHistoryMode(url) {
        const newUrl = new URL(this._resolveBaseUrl(url), globalThis.location.href);
        if (newUrl.origin !== globalThis.location.origin) {
            globalThis.location.href = newUrl.href;
            return;
        }
        if (newUrl.href !== globalThis.location.href) {
            globalThis.history.pushState({}, '', newUrl.href);
            this._onchange(new CustomEvent('pushstate'));
        }
        this._invokeRouteHandler(newUrl.pathname);
    }
    _handleHashchange(event) {
        this._onchange(event);
        this._invokeRouteHandler(globalThis.location.hash.substring(1));
    }
    _handlePopstate(event) {
        this._onchange(event);
        this._invokeRouteHandler(globalThis.location.pathname);
    }
    _invokeRouteHandler(path) {
        try {
            if (this._routeCollection.size) {
                for (const [pattern, handler] of this._routeCollection){
                    const params = this._match(path, pattern);
                    if (params) {
                        handler(params);
                        break;
                    }
                }
            }
        } catch (exception) {
            this._onerror(exception);
        }
    }
    _resolveBaseUrl(url) {
        return this._base && url.search(/^(https?:\/\/|\/)/i) === -1 ? this._base + url : url;
    }
    _fixRoutePattern(pattern) {
        return `/${pattern}`.replace(/([^?]):(\w+)/g, '$1(?<$2>[^/?#]+)').substring(1);
    }
    _match(path, pattern) {
        const params = {};
        if (isRegExpNamedCaptureGroupsAvailable) {
            const matches = path.match(new RegExp(pattern));
            if (matches) {
                if (matches.groups) {
                    Object.assign(params, matches.groups);
                }
                return params;
            }
        } else {
            const groupNames = [];
            const namedGroupRegExp = /\(\?<(\w+)>([^()]+)\)/g;
            const patternA = pattern.replace(namedGroupRegExp, (_substring, groupName, groupPattern)=>{
                groupNames.push(groupName);
                return `(${groupPattern})`;
            });
            const patternB = pattern.replace(namedGroupRegExp, '(?:$2)');
            const matchesA = path.match(new RegExp(patternA));
            const matchesB = path.match(new RegExp(patternB));
            if (matchesA && matchesB) {
                if (groupNames.length) {
                    let iN = 0;
                    let iB = 1;
                    for(let iA = 1; iA < matchesA.length; iA++){
                        if (matchesA[iA] === matchesB[iB]) {
                            iB++;
                        } else {
                            params[groupNames[iN]] = matchesA[iA];
                            iN++;
                        }
                    }
                }
                return params;
            }
        }
        return null;
    }
}
class WebStorage {
    _mode;
    _prefix;
    _storage;
    constructor(mode, prefix = ''){
        this._mode = mode;
        this._prefix = prefix;
        switch(this._mode){
            case 'local':
                {
                    this._storage = globalThis.localStorage;
                    break;
                }
            case 'session':
                {
                    this._storage = globalThis.sessionStorage;
                    break;
                }
            default:
                {
                    throw new Error('The mode must be set "local" or "session".');
                }
        }
    }
    get mode() {
        return this._mode;
    }
    get prefix() {
        return this._prefix;
    }
    get length() {
        return this._storage.length;
    }
    key(index) {
        return this._storage.key(index);
    }
    setItem(key, value) {
        this._storage.setItem(this._prefix + key, JSON.stringify({
            _k: key,
            _v: value
        }));
    }
    getItem(key) {
        const value = this._storage.getItem(this._prefix + key);
        if (value) {
            try {
                const deserializedValue = JSON.parse(value);
                if (deserializedValue && deserializedValue._k === key && deserializedValue._v !== undefined) {
                    return deserializedValue._v;
                }
            } catch  {
                return value;
            }
        }
        return value;
    }
    removeItem(key) {
        this._storage.removeItem(this._prefix + key);
    }
    clear() {
        this._storage.clear();
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
