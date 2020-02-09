import Chirit from '../chirit.js';

export default async function() {
    const main = document.getElementById('main') as Element;
    const target = document.createElement('div');
    main.appendChild(target);

    const stateManager = new Chirit.StateManager(target);

    console.log(stateManager.target);

    stateManager.eventHandler.add('A', (data) => {
        console.log(data);
        return data.invoke ? {event: true} : false;
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

    await stateManager.invokeHandlers('A', {invoke: true});

    target.dispatchEvent(new CustomEvent('A', {detail: {dispatch: true}}));
}
