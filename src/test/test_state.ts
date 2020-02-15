import Chirit from '../chirit.js';

export default async function() {
    const stateA = new Chirit.State();

    console.log(stateA.state);
    await stateA.update({update: true});
    console.log(stateA.state);

    const stateB = new Chirit.State(
        {initial: true},
        (data, state) => {
            console.log(data, state);
            return data;
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

    console.log(stateB.state);
    await stateB.update({update: true});
    console.log(stateB.state);

    stateB.setHandler((data, state) => {
        return {...state, ...data};
    });

    const observer = () => {
        console.log('observer');
    };
    stateB.addObserver(observer);
    stateB.removeObserver(observer);

    await stateB.update({initial: false});
    console.log(stateB.state);
}
