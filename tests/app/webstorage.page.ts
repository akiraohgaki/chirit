import { WebStorage } from '../../mod.ts';
import { addLog, createActions } from './page.ts';

export default function (): void {
  let webStorage: WebStorage;
  let storage: Storage;

  createActions({
    'init-local': () => {
      webStorage = new WebStorage('local', 'test_');
      storage = localStorage;
      storage.clear();
    },
    'init-session': () => {
      webStorage = new WebStorage('session', 'test_');
      storage = sessionStorage;
      storage.clear();
    },
    'init-invalid': () => {
      try {
        // @ts-ignore for testing
        webStorage = new WebStorage('invalid', 'test_');
      } catch (exception) {
        addLog(`exception: ${(exception as Error).message}`);
      }
    },
    'prop-mode': () => {
      addLog(webStorage.mode);
    },
    'prop-prefix': () => {
      addLog(webStorage.prefix);
    },
    'prop-size': () => {
      addLog(`${webStorage.size}`);
    },
    'method-keys': () => {
      addLog(JSON.stringify(webStorage.keys().toSorted()));
    },
    'method-set': () => {
      webStorage.set('boolean', true);
      webStorage.set('number', 1);
      webStorage.set('string', 'text');
      webStorage.set('array', [0, 1, 2]);
      webStorage.set('object', { key0: 0, key1: 1, key2: 2 });
      webStorage.set('null', null);
      webStorage.set('undefined', undefined);

      storage.setItem('test_invalidjson', 'invalid');
      storage.setItem('test_invalidobject', '{}');
    },
    'method-get': () => {
      addLog(JSON.stringify([
        webStorage.get('boolean'),
        webStorage.get('number'),
        webStorage.get('string'),
        webStorage.get('array'),
        webStorage.get('object'),
        webStorage.get('null'),
        webStorage.get('undefined'),
        webStorage.get('invalidjson'),
        webStorage.get('invalidobject'),
        webStorage.get('undefinedkey'),
      ]));

      addLog(JSON.stringify([
        storage.getItem('test_boolean'),
        storage.getItem('test_number'),
        storage.getItem('test_string'),
        storage.getItem('test_array'),
        storage.getItem('test_object'),
        storage.getItem('test_null'),
        storage.getItem('test_undefined'),
        storage.getItem('test_invalidjson'),
        storage.getItem('test_invalidobject'),
        storage.getItem('test_undefinedkey'),
      ]));
    },
    'method-delete': () => {
      webStorage.delete('boolean');
      webStorage.delete('number');
      webStorage.delete('string');
      webStorage.delete('array');
      webStorage.delete('object');
      webStorage.delete('null');
      webStorage.delete('undefined');
      webStorage.delete('invalidjson');
      webStorage.delete('invalidobject');
      webStorage.delete('undefinedkey');
    },
    'method-clear': () => {
      webStorage.clear();
    },
  });
}
