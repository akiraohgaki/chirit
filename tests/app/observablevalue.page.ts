import { ObservableValue } from '../../mod.ts';
import { addLog, createActions } from './page.ts';

export default function (): void {
  let observableValue: ObservableValue<string>;

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
      observableValue = new ObservableValue('');
    },
    'method-subscribe': () => {
      observableValue.subscribe(observer1);
      observableValue.subscribe(observer2);
      observableValue.subscribe(observer3);
    },
    'method-unsubscribe': () => {
      observableValue.unsubscribe(observer1);
      observableValue.unsubscribe(observer2);
      observableValue.unsubscribe(observer3);
    },
    'method-notify': () => {
      observableValue.notify();
    },
    'method-set': () => {
      observableValue.set('text');
    },
    'method-get': () => {
      addLog(observableValue.get());
    },
  });
}
