import { Router } from '../../mod.ts';
import { addLog, createActions } from './page.ts';

export default function (): void {
  let router: Router;

  createActions({
    'init-hash': () => {
      router = new Router('hash', '/router');
    },
    'init-history': () => {
      router = new Router('history', '/router');
    },
    'init-invalid': () => {
      try {
        // @ts-ignore for testing
        router = new Router('invalid', '/router');
      } catch (exception) {
        addLog(`exception: ${(exception as Error).message}`);
      }
    },
    'prop-mode': () => {
      addLog(router.mode);
    },
    'prop-base': () => {
      addLog(router.base);
    },
    'prop-onchange': () => {
      router.onchange = (event) => {
        addLog(`onchange: ${event.type}`);
      };
    },
    'prop-onerror': () => {
      router.onerror = (exception) => {
        addLog(`onerror: ${(exception as Error).message}`);
      };
    },
    'method-set': () => {
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
    },
    'method-delete': () => {
      router.delete('/router/path/:name1/:name2');
      router.delete('/router/path/(?<name1>[^/?#]+)');
      router.delete('/router/error');
    },
    'method-navigate-root': () => {
      router.navigate('/');
      addLog(location.href);
    },
    'method-navigate-parent': () => {
      router.navigate('../');
      addLog(location.href);
    },
    'method-navigate-current': () => {
      router.navigate('./');
      addLog(location.href);
    },
    'method-navigate-pathto1': () => {
      router.navigate('path/to/1');
      addLog(location.href);
    },
    'method-navigate-pathto': () => {
      router.navigate('path/to');
      addLog(location.href);
    },
    'method-navigate-error': () => {
      router.navigate('error');
      addLog(location.href);
    },
    'method-navigate-noroute': () => {
      router.navigate('noroute');
      addLog(location.href);
    },
    'method-navigate-hashpathto1': () => {
      router.navigate('#path/to/1');
      addLog(location.href);
    },
    'method-navigate-querykv': () => {
      router.navigate('?k=v');
      addLog(location.href);
    },
    'method-navigate-locationorigin': () => {
      router.navigate(location.origin);
      addLog(location.href);
    },
    'method-navigate-examplecom': () => {
      router.navigate('https://example.com/');
      addLog(location.href);
    },
  });
}
