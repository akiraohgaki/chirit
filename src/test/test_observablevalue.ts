import {ObservableValue} from '../chirit.js';

function observerA(value: number): void {
    console.log('observerA');
    console.log(value);
}

function observerB(value: number): void {
    console.log('observerB');
    console.log(value);
}

export default function(): void {
    const observableValue = new ObservableValue(0);

    observableValue.subscribe(observerA);
    observableValue.subscribe(observerB);
    observableValue.unsubscribe(observerB);

    observableValue.notify();

    observableValue.set(observableValue.get() + 1);
}
