import * as chirit from '../../mod.ts';

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function addResult(content: string | Node | NodeList): void {
  const result = document.createElement('div');
  result.setAttribute('data-content', 'result');

  if (typeof content === 'string') {
    result.innerHTML = content;
  } else if (content instanceof Node) {
    result.appendChild(content.cloneNode(true));
  } else if (content instanceof NodeList) {
    for (const node of Array.from(content)) {
      result.appendChild(node.cloneNode(true));
    }
  }

  const results = document.querySelector('[data-content="results"]') as HTMLElement;
  results.appendChild(result);
}

function clearResults(): void {
  const results = document.querySelector('[data-content="results"]') as HTMLElement;
  results.innerHTML = '';
}

function addLog(data: unknown): void {
  console.log(data);

  let content = '';
  if (Array.isArray(data) || (typeof data === 'object' && data !== null)) {
    content = JSON.stringify(data);
  } else {
    content = '' + data;
  }

  const log = document.createElement('pre');
  log.setAttribute('data-content', 'log');
  log.textContent = content;

  const logs = document.querySelector('[data-content="logs"]') as HTMLElement;
  logs.appendChild(log);
}

function clearLogs(): void {
  const logs = document.querySelector('[data-content="logs"]') as HTMLElement;
  logs.innerHTML = '';
}

function runCode(): void {
  const context = { chirit, wait, addResult, clearResults, addLog, clearLogs };
  const code = document.querySelector('[data-content="code"]') as HTMLElement;
  const asyncCode = `(async () => { ${code.textContent ?? ''} })()`;
  const func = new Function(asyncCode).bind(context);

  try {
    func();
  } catch (exception) {
    console.error(exception);
    if (exception instanceof Error) {
      addLog(exception.message);
    }
  }
}

const template = document.createElement('template');
template.innerHTML = `
<header>
<h1>Playground</h1>
<p>Write and run code in the editor below.</p>
</header>

<main>
<section id="code">
<h2>Code</h2>
<pre><code data-content="code" contenteditable>
// const { createComponent, State } = this.chirit;

this.addResult('result');
this.addLog('log');

await this.wait(5000);

this.clearResults();
this.clearLogs();
</code></pre>
<button data-action="runCode">Run</button>
</section>

<section id="results">
<h2>Results</h2>
<div data-content="results"></div>
<button data-action="clearResults">Clear</button>
</section>

<section id="logs">
<h2>Logs</h2>
<div data-content="logs"></div>
<button data-action="clearLogs">Clear</button>
</section>
</main>
`;

const runCodeButton = template.content.querySelector('[data-action="runCode"]') as HTMLElement;
runCodeButton.addEventListener('click', runCode);

const clearResultsButton = template.content.querySelector('[data-action="clearResults"]') as HTMLElement;
clearResultsButton.addEventListener('click', clearResults);

const clearLogsButton = template.content.querySelector('[data-action="clearLogs"]') as HTMLElement;
clearLogsButton.addEventListener('click', clearLogs);

document.body.appendChild(template.content);
