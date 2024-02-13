import { Store } from '../../mod.ts';
import { addLog, createActions } from './page.ts';

export default function (): void {
  const state = { key0: 0, key1: 1, key2: { key0: 0 } };

  let store: Store<typeof state>;

  const observer1 = (value: typeof state) => {
    addLog(`observer1: ${JSON.stringify(value)}`);
  };
  const observer2 = (value: typeof state) => {
    addLog(`observer2: ${JSON.stringify(value)}`);
  };
  const observer3 = (value: typeof state) => {
    addLog(`observer3: ${JSON.stringify(value)}`);
  };

  createActions({
    'init': () => {
      store = new Store(state);
    },
    'prop-state': () => {
      addLog(JSON.stringify(store.state));
    },
    'method-subscribe': () => {
      store.subscribe(observer1);
      store.subscribe(observer2);
      store.subscribe(observer3);
    },
    'method-unsubscribe': () => {
      store.unsubscribe(observer1);
      store.unsubscribe(observer2);
      store.unsubscribe(observer3);
    },
    'method-notify': () => {
      store.notify();
    },
    'method-update': () => {
      store.update({ key0: 10 });
    },
    'object-state': () => {
      const store = new Store(state);
      addLog(`initial state object is same reference: ${store.state === state}`);
      addLog(`initial state.key2 object is same reference: ${store.state.key2 === state.key2}`);

      const prevState = store.state;
      store.update({ key0: 10 });
      addLog(`updated state object is same reference: ${store.state === prevState}`);
      addLog(`updated state.key2 object is same reference: ${store.state.key2 === prevState.key2}`);
    },
  });
}
