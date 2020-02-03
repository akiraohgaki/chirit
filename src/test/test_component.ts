import Chirit from '../chirit.js';

class TestComponent extends Chirit.Component {

    initShadow() {
        this.enableShadow({mode: 'closed'});
    }

    init() {
        console.log(this.contentRoot);

        this.state = {dummy: true};
        console.log(this.state);

        this.setState({text: 'Test'});
        console.log(this.getState());

        this.contentRoot.addEventListener('click', (event) => {
            const target = event.target as Element;
            if (target.closest('[data-change="attribute"]')) {
                this.setAttribute('text', `${new Date}`);
            }
            else if (target.closest('[data-change="state"]')) {
                this.setState({text: `${new Date}`});
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
        console.log(this.dispatch('dummy', {dummy: true}));
    }

}

TestComponent.define('test-component');

export default function() {
    const main = document.getElementById('main') as Element;
    main.innerHTML = '<test-component text="Test"></test-component>';
}
