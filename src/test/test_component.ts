import Chirit from '../chirit.js';

class TestComponent extends Chirit.Component {

    initShadow() {
        return this.attachShadow({mode: 'closed'});
    }

    init() {
        console.log(this.contentRoot);

        this.state = {dummy: true};
        console.log(this.state);

        this.setState({text: 'State'});
        console.log(this.getState());

        this.contentRoot.addEventListener('click', (event) => {
            const target = event.target as Element;
            switch (target.getAttribute('data-change')) {
                case 'attribute': {
                    this.setAttribute('text', `${new Date}`);
                    break;
                }
                case 'state': {
                    this.setState({text: `${new Date}`});
                    break;
                }
            }
        });
    }

    template() {
        return `
        <p>${this.getAttribute('text')}</p>
        <p>${this.state.text}</p>
        <button data-change="attribute">Change attribute</button>
        <button data-change="state">Change state</button>
        `;
    }

    static get componentObservedAttributes() {
        return ['text'];
    }

    componentAttributeChangedCallback(attributeName: string, oldValue: string, newValue: string, namespace: string) {
        console.log(attributeName, oldValue, newValue, namespace);
    }

    componentConnectedCallback() {
        console.log('Connected');
    }

    componentDisconnectedCallback() {
        console.log('Disconnected');
    }

    componentAdoptedCallback(oldDocument: Document, newDocument: Document) {
        console.log(oldDocument, newDocument);
    }

    componentStateChangedCallback(oldState: object, newState: object) {
        console.log(oldState, newState);
    }

    componentUpdatedCallback() {
        console.log('Updated');
    }

}

TestComponent.define('test-component');

export default function() {
    const main = document.getElementById('main') as Element;
    main.innerHTML = `
    <div id="component-wrapper">
    <test-component text="Attribute"></test-component>
    </div>
    `;

    const wrapper = document.getElementById('component-wrapper') as Element;
    const testComponent = wrapper.querySelector('test-component') as TestComponent;

    wrapper.addEventListener('dummy', (event) => {
        console.log(event);
    });

    console.log(testComponent.contentRoot);
    console.log(testComponent.dispatch('dummy', {dummy: true}));
}
