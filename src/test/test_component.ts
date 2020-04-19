import Chirit from '../chirit.js';

class TestComponent extends Chirit.Component {

    constructor() {
        super();

        this.contentRoot.addEventListener('click', (event) => {
            const target = event.target as Element;
            if (target.hasAttribute('data-update')) {
                // Scheduled update should work
                this.attrs.datetime = 'dummy1';
                this.attrs.datetime = 'dummy2';
                this.attrs.datetime = `${new Date}`;
            }
        });
    }

    static get observedAttributes() {
        return ['datetime'];
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        console.log('Attribute changed');
        console.log(name, oldValue, newValue);
        super.attributeChangedCallback(name, oldValue, newValue);
    }

    connectedCallback() {
        console.log('Connected');
        super.connectedCallback();
    }

    disconnectedCallback() {
        console.log('Disconnected');
    }

    adoptedCallback(oldDocument: Document, newDocment: Document) {
        console.log('Adopted');
        console.log(oldDocument, newDocment);
    }

    updatedCallback() {
        console.log('Updated');
    }

    initShadow() {
        return this.attachShadow({mode: 'closed'});
    }

    template() {
        return `
            <p>${this.attrs.datetime}</p>
            <button data-update>Update</button>
        `;
    }

}

TestComponent.define('test-component');

export default function() {
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

    console.log(testComponent.contentRoot);

    console.log(testComponent.attrs);
    console.log('datetime' in testComponent.attrs);
    console.log('dummy' in testComponent.attrs);
    console.log(Reflect.ownKeys(testComponent.attrs));
    console.log(Object.keys(testComponent.attrs));
    console.log(JSON.stringify(testComponent.attrs));

    iframe.contentDocument?.body.appendChild(testComponent);
    wrapper.appendChild(testComponent);

    wrapper.addEventListener('dummy', (event) => {
        console.log(event);
    });
    console.log(testComponent.dispatch('dummy', {dummy: true}));

    // Scheduled update should work
    testComponent.update();
    testComponent.update();
    testComponent.update();
}
