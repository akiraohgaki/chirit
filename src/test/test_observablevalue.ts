import {ObservableValue} from '../chirit.js';

function observerA(value: number) {
    console.log('observerA');
    console.log(value);
}

function observerB(value: number) {
    console.log('observerB');
    console.log(value);
}

function observerC(value: number) {
    console.log('observerC');
    console.log(value);
}

export default function() {
    const observableValue = new ObservableValue(0, [observerA, observerB]);

    observableValue.set(observableValue.get() + 1);

    observableValue.subscribe(observerC);

    observableValue.unsubscribe(observerB);

    observableValue.notify();
}
