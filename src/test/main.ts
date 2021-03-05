import test_component from './test_component.js';
import test_customelement from './test_customelement.js';
import test_elementattributesproxy from './test_elementattributesproxy.js';
import test_nodecontent from './test_nodecontent.js';
import test_observable from './test_observable.js';
import test_observablevalue from './test_observablevalue.js';
import test_router from './test_router.js';
import test_webstorage from './test_webstorage.js';

const handlerCollection = new Map([
    ['test_component', test_component],
    ['test_customelement', test_customelement],
    ['test_elementattributesproxy', test_elementattributesproxy],
    ['test_nodecontent', test_nodecontent],
    ['test_observable', test_observable],
    ['test_observablevalue', test_observablevalue],
    ['test_router', test_router],
    ['test_webstorage', test_webstorage]
]);

let navItems = '';
for (const key of handlerCollection.keys()) {
    navItems += `<a href="#" data-handler="${key}">${key}</a>`;
}

const template = document.createElement('template');
template.innerHTML = `
    <style>
    :root {
        font: 14px/1.5 system-ui;
    }

    #nav a {
        display: inline-block;
        margin: 0.2rem 1rem;
        text-decoration: none;
        color: dodgerblue;
    }
    </style>

    <nav id="nav">${navItems}</nav>
    <main id="main">See console log</main>
`;
document.body.appendChild(template.content);

const nav = document.getElementById('nav') as Element;
const main = document.getElementById('main') as Element;

nav.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target as Element;
    const handlerKey = target.getAttribute('data-handler');
    if (handlerKey) {
        const handler = handlerCollection.get(handlerKey);
        if (handler) {
            main.textContent = null;
            console.log(`---- ${handlerKey} ----`);
            handler();
        }
    }
});
