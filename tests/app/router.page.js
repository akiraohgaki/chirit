import { Router } from './mod.bundle.js';
import { addContent, addLog } from './page.js';

export default function () {
  let router = null;

  const template = document.createElement('template');

  template.innerHTML = `
    <nav>
      <p>
        Initialization
        <button data-action="init-hash">init (hash mode)</button>
        <button data-action="init-history">init (history mode)</button>
        <button data-action="init-invalid">init (invalid mode)</button>
      </p>
      <p>
        Properties
        <button data-action="prop-mode">mode</button>
        <button data-action="prop-base">base</button>
        <button data-action="prop-onchange">onchange</button>
        <button data-action="prop-onerror">onerror</button>
      </p>
      <p>
        Methods
        <button data-action="method-set">set</button>
        <button data-action="method-delete">delete</button>
        <button data-action="method-navigate-root">navigate (/)</button>
        <button data-action="method-navigate-parent">navigate (../)</button>
        <button data-action="method-navigate-current">navigate (./)</button>
        <button data-action="method-navigate-pathto1">navigate (path/to/1)</button>
        <button data-action="method-navigate-pathto">navigate (path/to)</button>
        <button data-action="method-navigate-error">navigate (error)</button>
        <button data-action="method-navigate-noroute">navigate (noroute)</button>
        <button data-action="method-navigate-hashpathto1">navigate (#path/to/1)</button>
        <button data-action="method-navigate-querykv">navigate (?k=v)</button>
        <button data-action="method-navigate-locationorigin">navigate (location.origin)</button>
        <button data-action="method-navigate-examplecom">navigate (https://example.com/)</button>
      </p>
    </nav>
  `;

  template.content.querySelector('nav').addEventListener('click', (event) => {
    switch (event.target.getAttribute('data-action')) {
      case 'init-hash': {
        router = new Router('hash', '/router');
        addLog('init (hash mode)');
        break;
      }
      case 'init-history': {
        router = new Router('history', '/router');
        addLog('init (history mode)');
        break;
      }
      case 'init-invalid': {
        try {
          router = new Router('invalid', '/router');
          addLog('init (invalid mode)');
        } catch (exception) {
          addLog(`exception: ${exception.message}`);
        }
        break;
      }
      case 'prop-mode': {
        addLog(`mode: ${router.mode}`);
        break;
      }
      case 'prop-base': {
        addLog(`base: ${router.base}`);
        break;
      }
      case 'prop-onchange': {
        router.onchange = (event) => {
          addLog(`onchange: ${event.type}`);
        };
        addLog('onchange');
        break;
      }
      case 'prop-onerror': {
        router.onerror = (exception) => {
          addLog(`onerror: ${exception.message}`);
        };
        addLog('onerror');
        break;
      }
      case 'method-set': {
        router.set('/router/path/:name1/:name2', (params) => {
          addLog(`params: ${JSON.stringify(params)}`);
        });
        router.set('/router/path/(?<name1>[^/?#]+)', (params) => {
          addLog(`params: ${JSON.stringify(params)}`);
        });
        router.set('/router/error', (params) => {
          addLog(`params: ${JSON.stringify(params)}`);
          throw new Error('error');
        });
        addLog('set');
        break;
      }
      case 'method-delete': {
        router.delete('/router/path/:name1/:name2');
        router.delete('/router/path/(?<name1>[^/?#]+)');
        router.delete('/router/error');
        addLog('delete');
        break;
      }
      case 'method-navigate-root': {
        router.navigate('/');
        addLog(location.href);
        break;
      }
      case 'method-navigate-parent': {
        router.navigate('../');
        addLog(location.href);
        break;
      }
      case 'method-navigate-current': {
        router.navigate('./');
        addLog(location.href);
        break;
      }
      case 'method-navigate-pathto1': {
        router.navigate('path/to/1');
        addLog(location.href);
        break;
      }
      case 'method-navigate-pathto': {
        router.navigate('path/to');
        addLog(location.href);
        break;
      }
      case 'method-navigate-error': {
        router.navigate('error');
        addLog(location.href);
        break;
      }
      case 'method-navigate-noroute': {
        router.navigate('noroute');
        addLog(location.href);
        break;
      }
      case 'method-navigate-hashpathto1': {
        router.navigate('#path/to/1');
        addLog(location.href);
        break;
      }
      case 'method-navigate-querykv': {
        router.navigate('?k=v');
        addLog(location.href);
        break;
      }
      case 'method-navigate-locationorigin': {
        router.navigate(location.origin);
        addLog(location.href);
        break;
      }
      case 'method-navigate-examplecom': {
        router.navigate('https://example.com/');
        addLog(location.href);
        break;
      }
      default: {
        break;
      }
    }
  });

  addContent(template.content);
}
