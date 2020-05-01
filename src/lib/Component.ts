import {Dictionary, NodeContentData} from './types.js';
import NodeContent from './NodeContent.js';

export default class Component extends HTMLElement {

    private _contentRoot: Node;
    private _attrs: Dictionary<string | null>;
    private _isUpdated: boolean;

    private _updateTimerId: number | undefined;
    private _updateDelay: number;

    constructor() {
        super();

        this._contentRoot = this.initContentRoot();
        this._attrs = this.initAttrs();
        this._isUpdated = false;

        this._updateTimerId = undefined;
        this._updateDelay = 100;
    }

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    get contentRoot(): Node {
        return this._contentRoot;
    }

    get attrs(): Dictionary<string | null> {
        return this._attrs;
    }

    get isUpdated(): boolean {
        return this._isUpdated;
    }

    dispatch(type: string, detail?: any): boolean {
        return this.contentRoot.dispatchEvent(new CustomEvent(type, {
            detail: detail,
            bubbles: true,
            composed: true
        }));
    }

    update(): void {
        if (this._updateTimerId !== undefined) {
            window.clearTimeout(this._updateTimerId);
        }

        this._updateTimerId = window.setTimeout(() => {
            window.clearTimeout(this._updateTimerId);
            this._updateTimerId = undefined;
            this.updateSync();
        }, this._updateDelay);
    }

    updateSync(): void {
        this.render();
        this._isUpdated = true;
        this.updatedCallback();
    }

    // Lifecycle callbacks

    static get observedAttributes(): Array<string> {
        return [];
    }

    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null, _namespace?: string | null): void {
        if (this.isUpdated && oldValue !== newValue) {
            this.update();
        }
    }

    connectedCallback(): void {
        if (!this.isUpdated) {
            this.updateSync();
        }
    }

    disconnectedCallback(): void {}

    adoptedCallback(_oldDocument: Document, _newDocument: Document): void {}

    updatedCallback(): void {}

    // For sub classes

    protected initContentRoot(): Node {
        return this.attachShadow({mode: 'open'});
    }

    protected initAttrs(): Dictionary<string | null> {
        return new Proxy({}, {
            set: (_target, name, value) => {
                if (typeof name === 'string' && typeof value === 'string') {
                    this.setAttribute(name, value);
                    return true;
                }
                return false;
            },
            get: (_target, name) => {
                if (typeof name === 'string') {
                    return this.getAttribute(name);
                }
                return null;
            },
            deleteProperty: (_target, name) => {
                if (typeof name === 'string' && this.hasAttribute(name)) {
                    this.removeAttribute(name);
                    return true;
                }
                return false;
            },
            has: (_target, name) => {
                if (typeof name === 'string' && this.hasAttribute(name)) {
                    return true;
                }
                return false;
            },
            ownKeys: () => {
                const keys = [];
                const attributes = Array.from(this.attributes);
                for (const attribute of attributes) {
                    keys.push(attribute.name);
                }
                return keys;
            },
            getOwnPropertyDescriptor: (_target, name) => {
                if (typeof name === 'string' && this.hasAttribute(name)) {
                    return {
                        configurable: true,
                        enumerable: true,
                        value: this.getAttribute(name)
                    };
                }
                return undefined;
            }
        });
    }

    protected render(): void {
        const nodeContent = new NodeContent(this.contentRoot);
        nodeContent.update(this.template());
    }

    protected template(): NodeContentData {
        return '';
    }

}
