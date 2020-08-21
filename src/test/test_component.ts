import {Component} from '../chirit.js';

class TestComponent extends Component {

    constructor() {
        super();

        this.contentRoot.addEventListener('click', (event) => {
            const target = event.target as Element;
            if (target.hasAttribute('data-update')) {
                // Scheduled update should work
                this.attrs.datetime = `${new Date}`;
                this.attrs.plus += '+';
            }
        });
    }

    static get observedAttributes(): Array<string> {
        return ['datetime', 'plus'];
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        console.log('Attribute changed');
        console.log(name, oldValue, newValue);
        super.attributeChangedCallback(name, oldValue, newValue);
    }

    connectedCallback(): void {
        console.log('Connected');
        super.connectedCallback();
    }

    disconnectedCallback(): void {
        console.log('Disconnected');
    }

    adoptedCallback(oldDocument: Document, newDocment: Document): void {
        console.log('Adopted');
        console.log(oldDocument, newDocment);
    }

    updatedCallback(): void {
        console.log('Updated');
    }

    initContentRoot(): ShadowRoot {
        return this.attachShadow({mode: 'closed'});
    }

    template(): string {
        return `
            <p>${this.attrs.datetime}</p>
            <button data-update>Update</button>
        `;
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
    const testComponent = wrapper.querySelector('test-component') as TestComponent;

    console.log(testComponent.attrs);
    console.log(testComponent.content);
    console.log(testComponent.contentRoot);
    console.log(testComponent.isUpdated);

    iframe.contentDocument?.body.appendChild(testComponent);
    wrapper.appendChild(testComponent);

    wrapper.addEventListener('dummy', (event) => {
        console.log(event);
    });
    console.log(testComponent.dispatch('dummy', {dummy: true}));

    // Scheduled update should work
    testComponent.attrs.plus = '+';
    testComponent.update();

    testComponent.updateSync();
}
