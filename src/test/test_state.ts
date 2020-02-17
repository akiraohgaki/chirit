import Chirit from '../chirit.js';

function handler(data: object, state: object) {
    console.log(data, state);
    return {...state, ...data};
}

function observerA(state: object) {
    console.log('observerA');
    console.log(state);
};

function observerB(state: object) {
    console.log('observerB');
    console.log(state);
};

export default async function() {
    const stateA = new Chirit.State();
    console.log(stateA.state);

    await stateA.update({hasInitial: false});
    console.log(stateA.state);

    stateA.setHandler(handler);

    stateA.addObserver(observerA);
    stateA.addObserver(observerB);
    stateA.removeObserver(observerB);

    await stateA.update({update: true});
    console.log(stateA.state);

    const stateB = new Chirit.State(
        {hasInitial: true},
        handler,
        [observerA, observerB]
    );

    await stateB.update({update: true});
    console.log(stateB.state);
}
