import Chirit from '../chirit.js';

export default function() {
    const element = document.createElement('div');

    const stateManager = new Chirit.StateManager(element);

    console.log(stateManager.target);

    stateManager.eventHandler.add('A', (data) => {
        console.log(data);
        return data.dispatch ? {event: true} : false;
    });

    stateManager.actionHandler.add('A', (data) => {
        console.log(data);
        return data.event ? {action: true} : false;
    });

    stateManager.stateHandler.add('A', (data) => {
        console.log(data);
        return data.action ? {state: true} : false;
    });

    stateManager.viewHandler.add('A', (data) => {
        console.log(data);
        console.log(stateManager.state.get('A'));
        return data.state ? {view: true} : false;
    });

    const dummyHandler = () => false;

    stateManager.actionHandler.add('B', dummyHandler);

    console.log(stateManager.state.get('B'));

    stateManager.actionHandler.remove('B', dummyHandler);

    console.log(stateManager.state.get('B'));

    console.log(stateManager.dispatch('A', {dispatch: true}));
}
