import test_component from './test_component.js';
import test_elementattributesproxy from './test_elementattributesproxy.js';
import test_nodecontent from './test_nodecontent.js';
import test_observable from './test_observable.js';
import test_observablevalue from './test_observablevalue.js';
import test_router from './test_router.js';
import test_webstorage from './test_webstorage.js';

const handlerCollection = new Map([
    ['test_component', test_component],
    ['test_elementattributesproxy', test_elementattributesproxy],
    ['test_nodecontent', test_nodecontent],
    ['test_observable', test_observable],
    ['test_observablevalue', test_observablevalue],
    ['test_router', test_router],
    ['test_webstorage', test_webstorage]
]);

let listItems = '';
for (const key of handlerCollection.keys()) {
    listItems += `<li><a href="#" data-handler="${key}">${key}</a></li>`;
}

const template = document.createElement('template');
template.innerHTML = `
    <style>
    #nav ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    #nav ul li {
        display: inline-block;
        margin: 0;
        padding: 0.4em;
    }
    #nav a {
        display: inline-block;
        padding: 0.6em;
        border-radius: 1.2em;
        text-decoration: none;
        font: 12px/1 system-ui;
        color: ghostwhite;
        background: deepskyblue;
        transition: background 0.3s;
    }
    #nav a:hover {
        background: dodgerblue;
    }
    </style>

    <nav id="nav"><ul>${listItems}</ul></nav>
    <main id="main"></main>
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
