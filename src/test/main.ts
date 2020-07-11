import test_component from './test_component.js';
import test_nodecontent from './test_nodecontent.js';
import test_observable from './test_observable.js';
import test_observablevalue from './test_observablevalue.js';
import test_router from './test_router.js';
import test_webstorage from './test_webstorage.js';
import test_utility from './test_utility.js';

const handlerCollection = new Map([
    ['test_component', test_component],
    ['test_nodecontent', test_nodecontent],
    ['test_observable', test_observable],
    ['test_observablevalue', test_observablevalue],
    ['test_router', test_router],
    ['test_webstorage', test_webstorage],
    ['test_utility', test_utility]
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
