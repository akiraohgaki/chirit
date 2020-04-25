import {Observable} from '../chirit.js';

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
    const observable = new Observable([observerA, observerB]);

    observable.notify(1);

    observable.subscribe(observerC);

    observable.unsubscribe(observerB);

    observable.notify(2);
}
