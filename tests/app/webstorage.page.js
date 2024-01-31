import { WebStorage } from './mod.bundle.js';
import { addContent, addLog } from './page.js';

export default function () {
  let webStorage = null;
  let storage = null;

  const template = document.createElement('template');

  template.innerHTML = `
    <nav>
      <p>
        Initialization
        <button data-action="init-local">init (local mode)</button>
        <button data-action="init-session">init (session mode)</button>
        <button data-action="init-invalid">init (invalid mode)</button>
      </p>
      <p>
        Properties
        <button data-action="prop-mode">mode</button>
        <button data-action="prop-prefix">prefix</button>
        <button data-action="prop-size">size</button>
      </p>
      <p>
        Methods
        <button data-action="method-keys">keys</button>
        <button data-action="method-set">set</button>
        <button data-action="method-get">get</button>
        <button data-action="method-delete">delete</button>
        <button data-action="method-clear">clear</button>
      </p>
    </nav>
  `;

  template.content.querySelector('nav').addEventListener('click', (event) => {
    switch (event.target.getAttribute('data-action')) {
      case 'init-local': {
        webStorage = new WebStorage('local', 'test_');
        storage = localStorage;
        addLog('init (local mode)');
        break;
      }
      case 'init-session': {
        webStorage = new WebStorage('session', 'test_');
        storage = sessionStorage;
        addLog('init (session mode)');
        break;
      }
      case 'init-invalid': {
        try {
          webStorage = new WebStorage('invalid', 'test_');
          addLog('init (invalid mode)');
        } catch (exception) {
          addLog(`exception: ${exception.message}`);
        }
        break;
      }
      case 'prop-mode': {
        addLog(`mode: ${webStorage.mode}`);
        break;
      }
      case 'prop-prefix': {
        addLog(`prefix: ${webStorage.prefix}`);
        break;
      }
      case 'prop-size': {
        addLog(`size: ${webStorage.size}`);
        break;
      }
      case 'method-keys': {
        addLog(`keys: ${JSON.stringify(webStorage.keys().toSorted())}`);
        break;
      }
      case 'method-set': {
        webStorage.set('boolean', true);
        webStorage.set('number', 1);
        webStorage.set('string', 'text');
        webStorage.set('array', [0, 1, 2]);
        webStorage.set('object', { key0: 0, key1: 1, key2: 2 });
        webStorage.set('null', null);
        webStorage.set('undefined', undefined);
        addLog('set');

        storage.setItem('test_invalidjson', 'invalid');
        storage.setItem('test_invalidobject', '{}');
        addLog('setItem');
        break;
      }
      case 'method-get': {
        addLog(`get: ${
          JSON.stringify([
            webStorage.get('boolean'),
            webStorage.get('number'),
            webStorage.get('string'),
            webStorage.get('array'),
            webStorage.get('object'),
            webStorage.get('null'),
            webStorage.get('undefined'),
            webStorage.get('invalidjson'),
            webStorage.get('invalidobject'),
            webStorage.get('undefinedname'),
          ])
        }`);

        addLog(`getItem: ${
          JSON.stringify([
            storage.getItem('test_boolean'),
            storage.getItem('test_number'),
            storage.getItem('test_string'),
            storage.getItem('test_array'),
            storage.getItem('test_object'),
            storage.getItem('test_null'),
            storage.getItem('test_undefined'),
            storage.getItem('test_invalidjson'),
            storage.getItem('test_invalidobject'),
            storage.getItem('test_undefinedname'),
          ])
        }`);
        break;
      }
      case 'method-delete': {
        webStorage.delete('boolean');
        webStorage.delete('number');
        webStorage.delete('string');
        webStorage.delete('array');
        webStorage.delete('object');
        webStorage.delete('null');
        webStorage.delete('undefined');
        webStorage.delete('invalidjson');
        webStorage.delete('invalidobject');
        webStorage.delete('undefinedname');
        addLog('delete');
        break;
      }
      case 'method-clear': {
        webStorage.clear();
        addLog('clear');
        break;
      }
      default: {
        break;
      }
    }
  });

  addContent(template.content);
}
