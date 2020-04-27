import {Observable} from '../chirit.js';

function observerA(value: number) {
    console.log('observerA');
    console.log(value);
}

function observerB(value: number) {
    console.log('observerB');
    console.log(value);
}

export default function() {
    const observable = new Observable<number>();

    observable.subscribe(observerA);
    observable.subscribe(observerB);
    observable.unsubscribe(observerB);

    observable.notify(1);
}
