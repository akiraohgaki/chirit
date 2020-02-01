import test_component from './test_component.js';
import test_nodecontent from './test_nodecontent.js';
import test_statemanager from './test_statemanager.js';
import test_handler from './test_handler.js';
import test_webstorage from './test_webstorage.js';
import test_utility from './test_utility.js';

function createButton(text: string, eventListener: EventListener): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', eventListener, false);
    return button;
}

const target = document.body;
target.appendChild(createButton('test_component', test_component));
target.appendChild(createButton('test_nodecontent', test_nodecontent));
target.appendChild(createButton('test_statemanager', test_statemanager));
target.appendChild(createButton('test_handler', test_handler));
target.appendChild(createButton('test_webstorage', test_webstorage));
target.appendChild(createButton('test_utility', test_utility));
