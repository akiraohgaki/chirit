import Chirit from '../chirit.js';

export default async function() {
    const target = document.createElement('div');

    const stateManager = new Chirit.StateManager(target);

    console.log(stateManager.target);

    const stateA = stateManager.create('stateA');
    stateManager.set('stateA', stateA);
    console.log(stateManager.has('stateA'));
    console.log(stateManager.get('stateA'));
    stateManager.delete('stateA');

    const stateB = stateManager.create(
        'stateB',
        {hasInitial: true},
        (data: object, state: object) => {
            return {hasHandler: true, ...state, ...data};
        },
        [
            (state) => {
                console.log('observer');
                console.log(state);
            }
        ]
    );

    await stateB.update({update: true});

    target.dispatchEvent(new CustomEvent('stateB', {detail: {updateFromEvent: true}}));
}
