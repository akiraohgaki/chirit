import test_component from './test_component.js';
import test_nodecontent from './test_nodecontent.js';
import test_statemanager from './test_statemanager.js';
import test_state from './test_state.js';
import test_webstorage from './test_webstorage.js';
import test_utility from './test_utility.js';

const handlerCollection = new Map([
    ['Component', test_component],
    ['NodeContent', test_nodecontent],
    ['StateManager', test_statemanager],
    ['State', test_state],
    ['WebStorage', test_webstorage],
    ['Utility', test_utility]
]);

const template = document.createElement('template');
template.innerHTML = `
    <nav id="nav">
    ${(() => {
        let buttons = '';
        for (const key of handlerCollection.keys()) {
            buttons += `<button data-handler-key="${key}">${key}</button>`;
        }
        return buttons;
    })()}
    </nav>
    <main id="main"></main>
`;
document.body.appendChild(template.content);

const nav = document.getElementById('nav') as Element;
const main = document.getElementById('main') as Element;

nav.addEventListener('click', (event) => {
    const target = event.target as Element;
    const handlerKey = target.getAttribute('data-handler-key');
    if (handlerKey) {
        const handler = handlerCollection.get(handlerKey);
        if (handler) {
            main.textContent = null;
            console.log('--------------------------------');
            handler();
        }
    }
});
