import Chirit from '../chirit.js';

interface DataDict {
    [key: string]: any;
}

function _testUtility() {
    console.log('----Utility');

    console.log(Chirit.Utility.parseQueryString());
    console.log(Chirit.Utility.parseQueryString('?key2=val2&key3'));
    console.log(Chirit.Utility.convertByteToHumanReadable(10000000000000000000000000));
    console.log(Chirit.Utility.convertDatetimeToHumanReadable('2045-01-01'));
    console.log(Chirit.Utility.convertDatetimeToHumanReadable(Date.now() - 1000000));
    console.log(Chirit.Utility.convertDatetimeToHumanReadable(new Date()));
    console.log(Chirit.Utility.generateRandomString());
    console.log(Chirit.Utility.generateRandomString(8));
    console.log(Chirit.Utility.generateRandomString(4, '~!@#$%^&*()_+'));
}

function _testWebStorage() {
    console.log('----WebStorage');

    sessionStorage.setItem('test_dummy0', 'dummy0');

    const webStorage = new Chirit.WebStorage('session', 'test_');

    webStorage.setItem('dummy1', [1,2,3]);
    webStorage.setItem('dummy2', [4,5,6]);
    webStorage.removeItem('dummy2');

    console.log(webStorage.type);
    console.log(webStorage.prefix);
    console.log(webStorage.length);
    console.log(webStorage.key(1));
    console.log(webStorage.getItem('dummy0'));
    console.log(webStorage.getItem('dummy1'));
    console.log(webStorage.getItem('dummy2'));

    webStorage.clear();
}

async function _testHandler() {
    console.log('----Handler');

    const handler = new Chirit.Handler(() => {
        return true;
    });

    const resultInitial = await handler.invoke();
    console.log(resultInitial);

    handler.defaultChangedCallback = (handler) => {
        console.log(handler);
    };

    handler.beforeAddCallback = (type, handler) => {
        console.log(type, handler);
    };

    handler.afterAddCallback = (type, handler) => {
        console.log(type, handler);
    };

    handler.beforeRemoveCallback = (type, handler) => {
        console.log(type, handler);
    };

    handler.afterRemoveCallback = (type, handler) => {
        console.log(type, handler);
    };

    handler
    .setDefault(() => {
        return false;
    })
    .resetDefault()
    .setDefault((data) => {
        return data;
    });

    const resultDefault = await handler.invoke({dummy: 0});
    console.log(resultDefault);

    const dummyHandlerA1 = () => {
        return {a: [1,2,3]};
    };

    const dummyHandlerA2 = () => {
        return {a: [4,5,6]};
    };

    const dummyHandlerB1 = (data: DataDict, type: string) => {
        data.dummy = 1;
        data[type] = [7,8,9];
        return data;
    };

    const dummyHandlerB2 = (data: DataDict, type: string) => {
        data.dummy = 2;
        data[type] = [10,11,12];
        return data;
    };

    const dummyHandlerC1 = () => {
        return false;
    };

    handler
    .add('a', dummyHandlerA1)
    .add('a', dummyHandlerA2)
    .add('b', dummyHandlerB1)
    .add('b', dummyHandlerB2).remove('b', dummyHandlerB2)
    .add('c', dummyHandlerC1).remove('c', dummyHandlerC1);

    console.log(handler.has('a'));
    console.log(handler.has('b'));
    console.log(handler.has('c'));

    const resultA = await handler.invoke({dummy: 0}, 'a');
    console.log(resultA);

    const resultB = await handler.invoke({dummy: 0}, 'b');
    console.log(resultB);

    const resultC = await handler.invoke({dummy: 0}, 'c');
    console.log(resultC);
}

function _testStateManager() {
    console.log('----StateManager');

    const stateManager = new Chirit.StateManager('body');

    console.log(stateManager.target);

    stateManager.eventHandler.add('a', (data, type) => {
        console.log(data, type);
        return {event: 0};
    });

    stateManager.actionHandler.add('a', (data, type) => {
        console.log(data, type);
        return {action: 0};
    });

    stateManager.stateHandler.add('a', (data, type) => {
        console.log(data, type);
        return {state: 0};
    });

    stateManager.viewHandler.add('a', (data, type) => {
        console.log(data, type);
        console.log(stateManager.state);
        return {view: 0};
    });

    const dummyHandler = () => {
        return false;
    };

    stateManager.actionHandler.add('b', dummyHandler);

    console.log(stateManager.state);

    stateManager.actionHandler.remove('b', dummyHandler);

    console.log(stateManager.state);

    console.log(stateManager.dispatch('a', {dispatch: 0}));
}

class TestComponent extends Chirit.Component {

    initShadow() {
        this.enableShadow({mode: 'closed'});
    }

    init() {
        console.log(this.contentRoot);

        this.state = {dummy1: [1,2,3]};
        console.log(this.state);

        this.setState({...this.state, dummy2: [4,5,6]});
        console.log(this.getState());

        console.log(this.getContent());
        const content = document.createElement('p');
        content.textContent = `test ${this.state.dummy1[0]}`;
        this.setContent(content);
        console.log(this.getContent());
    }

    template() {
        return `
            <p>test ${this.getAttribute('title')}</p>
        `;
    }

    static get componentObservedAttributes() {
        return ['title'];
    }

    componentAttributeChangedCallback(attributeName: string, oldValue: string, newValue: string, namespace: string) {
        console.log('componentAttributeChangedCallback', attributeName, oldValue, newValue, namespace);
    }

    componentConnectedCallback() {
        console.log('componentConnectedCallback', 'connected');
    }

    componentDisconnectedCallback() {
        console.log('componentDisconnectedCallback', 'disconnected');
    }

    componentAdoptedCallback(oldDocument: Node, newDocument: Node) {
        console.log('componentAdoptedCallback', oldDocument, newDocument);
    }

    componentStateChangedCallback(oldState: DataDict, newState: DataDict) {
        console.log('componentStateChangedCallback', oldState, newState);
    }

    componentContentChangedCallback(oldContent: Node, newContent: Node) {
        console.log('componentContentChangedCallback', oldContent, newContent);
    }

    componentUpdatedCallback() {
        console.log('componentUpdatedCallback', 'updated');
    }

}

function _testComponent() {
    console.log('----Component');

    TestComponent.define('test-component');
}

_testUtility();
_testWebStorage();
_testHandler();
_testStateManager();
_testComponent();
