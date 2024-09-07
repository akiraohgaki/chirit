import { Observable } from '../../mod.ts';
import { addLog, createActions } from './page.ts';

export default function (): void {
  let observable: Observable<string>;

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
      observable = new Observable();
    },
    'method-subscribe': () => {
      observable.subscribe(observer1);
      observable.subscribe(observer2);
      observable.subscribe(observer3);
    },
    'method-unsubscribe': () => {
      observable.unsubscribe(observer1);
      observable.unsubscribe(observer2);
      observable.unsubscribe(observer3);
    },
    'method-notify': () => {
      observable.notify('text');
    },
  });
}
