import {Dictionary, NodeContentData} from './types.js';
import NodeContent from './NodeContent.js';

export default class Component extends HTMLElement {

    private _shadowRoot: ShadowRoot | null;
    private _attrs: Dictionary<string | null>;
    private _updateTimerId: number | undefined;
    private _updateDelay: number;
    private _updateCount: number;

    constructor() {
        super();

        this._shadowRoot = this.initShadow();
        this._attrs = this.initAttrs();
        this._updateTimerId = undefined;
        this._updateDelay = 100;
        this._updateCount = 0;
    }

    static define(name: string, options?: ElementDefinitionOptions): void {
        window.customElements.define(name, this, options);
    }

    get contentRoot(): ShadowRoot | this {
        return this._shadowRoot || this.shadowRoot || this;
    }

    get attrs(): Dictionary<string | null> {
        return this._attrs;
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
            this._updateImmediate();
        }, this._updateDelay);
    }

    private _updateImmediate(): void {
        this.render();
        this._updateCount++;
        this.updatedCallback();
    }

    // Lifecycle callbacks

    static get observedAttributes(): Array<string> {
        return [];
    }

    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null, _namespace?: string | null): void {
        if (this._updateCount && oldValue !== newValue) {
            this.update();
        }
    }

    connectedCallback(): void {
        if (!this._updateCount) {
            this._updateImmediate();
        }
    }

    disconnectedCallback(): void {}

    adoptedCallback(_oldDocument: Document, _newDocument: Document): void {}

    updatedCallback(): void {}

    // For sub classes

    protected initShadow(): ShadowRoot | null {
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
