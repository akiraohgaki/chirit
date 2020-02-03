import test_component from './test_component.js';
import test_nodecontent from './test_nodecontent.js';
import test_statemanager from './test_statemanager.js';
import test_handler from './test_handler.js';
import test_webstorage from './test_webstorage.js';
import test_utility from './test_utility.js';

const handlers = new Map([
    ['Component', test_component],
    ['NodeContent', test_nodecontent],
    ['StateManager', test_statemanager],
    ['Handler', test_handler],
    ['WebStorage', test_webstorage],
    ['Utility', test_utility]
]);

const template = document.createElement('template');
template.innerHTML = `
<nav id="nav">
${(() => {
    let buttons = '';
    for (const key of handlers.keys()) {
        buttons += `<button data-handler="${key}">${key}</button>`;
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
    const element = target.closest('[data-handler]');
    if (element) {
        const handler = handlers.get(element.getAttribute('data-handler') as string);
        if (handler) {
            main.textContent = null;
            console.log('--------------------------------');
            handler();
        }
    }
});
