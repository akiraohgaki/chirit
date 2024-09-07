import { State } from '../../mod.ts';
import { addLog, createActions } from './page.ts';

export default function (): void {
  let state: State<string>;

  const observer1 = (value: string) => {
    addLog(`observer1: ${value}`);
  };
  const observer2 = (value: string) => {
    addLog(`observer2: ${value}`);
  };
  const observer3 = (value: string) => {
    addLog(`observer3: ${value}`);
  };

  createActions({
    'init': () => {
      state = new State('');
    },
    'method-subscribe': () => {
      state.subscribe(observer1);
      state.subscribe(observer2);
      state.subscribe(observer3);
    },
    'method-unsubscribe': () => {
      state.unsubscribe(observer1);
      state.unsubscribe(observer2);
      state.unsubscribe(observer3);
    },
    'method-notify': () => {
      state.notify();
    },
    'method-reset': () => {
      state.reset();
    },
    'method-set': () => {
      state.set('text');
    },
    'method-get': () => {
      addLog(state.get());
    },
  });
}
