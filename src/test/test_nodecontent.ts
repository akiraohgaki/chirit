import Chirit from '../chirit.js';

export default function() {
    const template = document.createElement('template');
    template.innerHTML = `
        <form id="nodecontent-form">
        <textarea id="nodecontent-contentsrc" style="width: 800px; height: 400px;">
        <header>
        <h1>header</h1>
        </header>
        <article>
        <p data-attr1="1" data-attr2="2" required>paragraph</p>
        <!-- comment -->
        text
        </article>
        </textarea>
        <br>
        <button>Update</button>
        </form>
        <div id="nodecontent-content"></div>
    `;
    document.body.appendChild(template.content);

    const form = document.getElementById('nodecontent-form') as HTMLFormElement;
    const contentSrc = document.getElementById('nodecontent-contentsrc') as HTMLTextAreaElement;
    const content = document.getElementById('nodecontent-content') as HTMLDivElement;

    const nodeContent = new Chirit.NodeContent(content);
    console.log(nodeContent.target);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        nodeContent.update(contentSrc.value);
    }, false);

}
