import Chirit from '../chirit.js';

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
    const observable = new Chirit.Observable(0, [observerA, observerB]);

    observable.subscribe(observerC);
    observable.unsubscribe(observerB);

    observable.set(observable.get() + 1);
}
