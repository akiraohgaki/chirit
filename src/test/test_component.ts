import {Component} from '../chirit.js';

class TestComponent extends Component {

    constructor() {
        super();
        this._handleClick = this._handleClick.bind(this);
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
        this.content.container.addEventListener('click', this._handleClick);
    }

    disconnectedCallback(): void {
        console.log('Disconnected');
        this.content.container.removeEventListener('click', this._handleClick);
    }

    adoptedCallback(oldDocument: Document, newDocment: Document): void {
        console.log('Adopted');
        console.log(oldDocument, newDocment);
    }

    renderedCallback(): void {
        console.log('Rendered');
    }

    template(): string {
        return `
            <span>${this.attrs.datetime}</span>
            <button data-update>Update</button>
        `;
    }

    private _handleClick(event: Event): void {
        const target = event.target as Element;
        if (target.hasAttribute('data-update')) {
            this.attrs.datetime = `${new Date}`;
            this.attrs.plus += '+';
        }
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

    iframe.contentDocument?.body.appendChild(testComponent);
    wrapper.appendChild(testComponent);

    wrapper.addEventListener('dummy', (event) => {
        console.log(event);
    });
    console.log(testComponent.dispatch('dummy', {dummy: true}));

    testComponent.attrs.plus = '+';
    testComponent.render();
}
