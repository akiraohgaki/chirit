import Chirit from '../chirit.js';

function handlerA(state: object, payload: object) {
    console.log('handlerA')
    console.log(state, payload);
}

function handlerB(state: object, payload: object) {
    console.log('handlerB')
    console.log(state, payload);
}

function observerA(state: object) {
    console.log('observerA');
    console.log(state);
};

function observerB(state: object) {
    console.log('observerB');
    console.log(state);
};

export default function() {
    const store = new Chirit.Store({hasInitial: true});

    console.log(store.state);

    store.addHandler('test', handlerA);
    store.addHandler('test', handlerB);
    store.addObserver('test', observerA);
    store.addObserver('test', observerB);

    store.dispatch('test', {dispatch: 1});

    store.removeHandler('test', handlerB);
    store.removeObserver('test', observerB);

    store.dispatch('test', {dispatch: 2});

    console.log(store.state);
}
