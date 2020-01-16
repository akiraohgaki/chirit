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

        const template = document.createElement('template');
        template.innerHTML = `<p>${this.state.text}</p>`;
        this.setContent(template);

        console.log(this.getContent());
    }

    template() {
        return `<p>${this.getAttribute('text') || this.state.text}</p>`;
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

    componentAdoptedCallback(oldDocument: Node, newDocument: Node) {
        console.log(oldDocument, newDocument);
    }

    componentStateChangedCallback(oldState: object, newState: object) {
        console.log(oldState, newState);
    }

    componentContentChangedCallback(oldContent: Node, newContent: Node) {
        console.log(oldContent, newContent);
    }

    componentUpdatedCallback() {
        console.log('Updated');
        console.log(this.dispatch('dummy', {dummy: true}));
    }

}

export default function() {
    TestComponent.define('test-component');

    if (!document.querySelector('test-component')) {
        const template = document.createElement('template');
        template.innerHTML = '<test-component text="Test"></test-component>';
        document.body.appendChild(template.content);
    }
}
