import {ObservableValue} from '../chirit.js';

function observerA(value: number): void {
    console.log('observerA');
    console.log(value);
}

function observerB(value: number): void {
    console.log('observerB');
    console.log(value);
}

function observerC(value: number): void {
    console.log('observerC');
    console.log(value);
}

export default function() {
    const observableValue = new ObservableValue(0, [observerA, observerB]);

    observableValue.notify();

    observableValue.subscribe(observerC);

    observableValue.unsubscribe(observerB);

    observableValue.set(observableValue.get() + 1);
}
