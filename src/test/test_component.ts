import {Component} from '../chirit.js';

class TestComponent extends Component {

    constructor() {
        console.log('constructor');
        super();
        console.log(this.updatedCount);
    }

    protected createContentContainer(): ShadowRoot {
        console.log('createContentContainer');
        return this.attachShadow({mode: 'closed'});
    }

    static get observedAttributes(): Array<string> {
        console.log('observedAttributes');
        return ['datetime', 'plus'];
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        console.log('attributeChangedCallback');
        console.log(name, oldValue, newValue);
        super.attributeChangedCallback(name, oldValue, newValue);
    }

    connectedCallback(): void {
        console.log('connectedCallback');
        super.connectedCallback();
    }

    disconnectedCallback(): void {
        console.log('disconnectedCallback');
    }

    adoptedCallback(oldDocument: Document, newDocment: Document): void {
        console.log('adoptedCallback');
        console.log(oldDocument, newDocment);
    }

    protected render(): void {
        console.log('render');
        super.render();
    }

    protected template(): string {
        console.log('template');
        return `
            <span>${this.attrs.datetime}</span>
            <button onclick="this.handleClick(event)">Update</button>
        `;
    }

    protected updatedCallback(): void {
        console.log('updatedCallback');
        console.log(this.updatedCount);
    }

    protected handleClick(event: Event): void {
        console.log(event);
        event.preventDefault();
        this.attrs.datetime = `${new Date}`;
        this.attrs.plus += '+';
    }

}

TestComponent.define('test-component');

export default function(): void {
    const main = document.getElementById('main') as Element;
    main.innerHTML = `
        <div id="component-wrapper">
        <iframe id="component-iframe" style="display: none;"></iframe>
        <test-component datetime="${new Date}"></test-component>
        </div>
    `;

    const wrapper = document.getElementById('component-wrapper') as Element;
    const iframe = document.getElementById('component-iframe') as HTMLIFrameElement;
    const testComponent = wrapper.querySelector('test-component') as Component;

    iframe.contentDocument?.body.appendChild(testComponent);
    wrapper.appendChild(testComponent);

    testComponent.attrs.plus = '+';
    testComponent.update();
    testComponent.updateSync();

    console.log(testComponent.updatedCount);

    console.log(testComponent.attrs);
    console.log(testComponent.content);

    wrapper.addEventListener('dummy', (event) => {
        console.log(event);
    });
    console.log(testComponent.dispatch('dummy', {dummy: true}));
}
