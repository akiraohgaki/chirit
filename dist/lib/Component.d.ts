import type { ComponentContentContainer, NodeContentData } from './types.js';
import CustomElement from './CustomElement.js';
import ElementAttributesProxy from './ElementAttributesProxy.js';
import NodeContent from './NodeContent.js';
export default class Component extends CustomElement {
    private _attrs;
    private _content;
    constructor();
    get attrs(): ElementAttributesProxy;
    get content(): NodeContent<ComponentContentContainer>;
    dispatch(type: string, detail?: any): boolean;
    protected createContentContainer(): ComponentContentContainer;
    protected render(): void;
    protected template(): NodeContentData;
}
