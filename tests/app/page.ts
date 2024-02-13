export function initPage(): void {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      #global-nav,
      #nav,
      #content,
      #log {
        margin: 1em;
        padding: 1em;
        border: 1px solid #cccccc;
      }
    </style>
    <nav id="global-nav"></nav>
    <nav id="nav"></nav>
    <main>
      <article id="content"></article>
      <aside id="log"></aside>
    </main>
  `;
  document.body.appendChild(template.content);

  createActions({
    'clear-content': () => {
      clearContent();
    },
    'clear-log': () => {
      clearLog();
    },
  }, getElement('#global-nav'));
}

export function createActions(actions: Record<string, { (): void }>, container?: Element): void {
  container = container ?? getElement('#nav');

  const template = document.createElement('template');
  let innerHtml = '';
  for (const key of Object.keys(actions)) {
    const name = escapeHtml(key);
    innerHtml += `<button data-action="${name}">${name}</button>`;
  }
  template.innerHTML = innerHtml;
  container.appendChild(template.content);

  container.addEventListener('click', (event) => {
    const action = (event.target as Element).getAttribute('data-action');
    if (action && action in actions) {
      addLog(action);
      actions[action]();
    }
  });
}

export function getElement(selector: string): Element {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error('Element not found');
  }
  return element;
}

export function getContent(): Element {
  return getElement('#content');
}

export function addContent(node: Node): void {
  getContent().appendChild(node);
}

export function clearContent(): void {
  getContent().textContent = '';
}

export function getLog(): Element {
  return getElement('#log');
}

export function addLog(message: string): void {
  console.log(message);

  const template = document.createElement('template');
  template.innerHTML = `<pre><code data-log>${escapeHtml(message)}</code></pre>`;
  getLog().appendChild(template.content);
}

export function clearLog(): void {
  getLog().textContent = '';
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll("'", '&apos;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
