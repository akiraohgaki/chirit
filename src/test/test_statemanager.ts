import Chirit from '../chirit.js';

export default async function() {
    const target = document.createElement('div');

    const stateManager = new Chirit.StateManager(target);

    console.log(stateManager.target);

    stateManager.createState('dummy');

    console.log(stateManager.hasState('dummy'));

    stateManager.removeState('dummy');

    console.log('State re-creation should work');
    stateManager.createState('dummy');
    stateManager.createState('dummy',
        {dummy: true},
        () => {
            return {handler: true};
        },
        [
            () => {
                console.log('observer');
            },
            (state) => {
                console.log('observer');
                console.log(state);
            }
        ]
    );

    console.log(stateManager.getState('dummy'));

    await stateManager.updateState('dummy', {});

    console.log(stateManager.getState('dummy'));

    stateManager.setHandler('dummy', (data, state) => {
        return {...state, ...data};
    });

    const observer = () => {
        console.log('observer');
    };
    stateManager.addObserver('dummy', observer);
    stateManager.removeObserver('dummy', observer);

    await stateManager.updateState('dummy', {update: true});

    console.log(stateManager.getState('dummy'));

    target.dispatchEvent(new CustomEvent('dummy', {detail: {event: true}}));
}
