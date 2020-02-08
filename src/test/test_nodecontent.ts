import Chirit from '../chirit.js';

export default function() {
    const main = document.getElementById('main') as Element;
    main.innerHTML = `
    <textarea id="nodecontent-src" style="width: 600px; height: 300px;"></textarea>
    <div id="nodecontent-methods">
    <button data-method="update-deep">Update (deep)</button>
    <button data-method="update-shallow">Update (shallow)</button>
    <button data-method="set">Set</button>
    <button data-method="get">Get</button>
    <button data-method="clear">Clear</button>
    </div>
    <div id="nodecontent-content"></div>
    `;

    const src = document.getElementById('nodecontent-src') as HTMLTextAreaElement;
    const content = document.getElementById('nodecontent-content') as Element;
    const methods = document.getElementById('nodecontent-methods') as Element;

    const template = document.createElement('template');
    template.innerHTML = `
    <ul data-attr1="1" data-attr2="2" data-attr3="3">
    <li>list1</li>
    <li>list2</li>
    <li>list3</li>
    </ul>
    `;
    src.value = template.innerHTML;

    const nodeContent = new Chirit.NodeContent(content);

    console.log(nodeContent.target);

    nodeContent.set(template);
    console.log(nodeContent.get());
    nodeContent.set(template.content);
    console.log(nodeContent.get());
    nodeContent.set(template.content.childNodes);
    console.log(nodeContent.get());

    nodeContent.update(template);
    nodeContent.update(template, false);
    console.log(nodeContent.get());
    nodeContent.update(template.content);
    console.log(nodeContent.get());
    nodeContent.update(template.content.childNodes);
    console.log(nodeContent.get());

    nodeContent.clear();

    methods.addEventListener('click', (event) => {
        const target = event.target as Element;
        switch (target.getAttribute('data-method')) {
            case 'update-deep': {
                nodeContent.update(src.value || '', true);
                break;
            }
            case 'update-shallow': {
                nodeContent.update(src.value || '', false);
                break;
            }
            case 'set': {
                nodeContent.set(src.value || '');
                break;
            }
            case 'get': {
                console.log(nodeContent.get());
                break;
            }
            case 'clear': {
                nodeContent.clear();
                break;
            }
        }
    });

}
