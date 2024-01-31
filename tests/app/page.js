export function initPage() {
  const template = document.createElement('template');

  template.innerHTML = `
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      #nav,
      #content,
      #log {
        margin: 1em;
        padding: 1em;
        border: 1px solid #cccccc;
      }
    </style>
    <main id="main">
      <nav id="nav">
        <button data-action="reload-page">reload page</button>
        <button data-action="clear-content">clear content</button>
        <button data-action="clear-log">clear log</button>
      </nav>
      <article id="content"></article>
      <aside id="log"></aside>
    </main>
  `;

  template.content.querySelector('#nav').addEventListener('click', (event) => {
    switch (event.target.getAttribute('data-action')) {
      case 'reload-page': {
        location.reload();
        break;
      }
      case 'clear-content': {
        clearContent();
        break;
      }
      case 'clear-log': {
        clearLog();
        break;
      }
      default: {
        break;
      }
    }
  });

  document.body.appendChild(template.content);
}

export function getElement(selector) {
  const element = document.querySelector(selector);
  if (element === null) {
    throw new Error('Element not found');
  }
  return element;
}

export function getContent() {
  return getElement('#content');
}

export function addContent(node) {
  getContent().appendChild(node);
}

export function clearContent() {
  getContent().textContent = '';
}

export function getLog() {
  return getElement('#log');
}

export function addLog(message) {
  console.log(message);

  const template = document.createElement('template');
  template.innerHTML = `<p data-log>${message}</p>`;
  getLog().appendChild(template.content);
}

export function clearLog() {
  getLog().textContent = '';
}
