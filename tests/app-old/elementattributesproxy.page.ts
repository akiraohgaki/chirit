import { ElementAttributesProxy } from '../../mod.ts';
import { addContent, addLog, createActions } from './page.ts';

export default function (): void {
  let elementAttributesProxy: ElementAttributesProxy;

  const element = document.createElement('div');
  addContent(element);

  createActions({
    'init': () => {
      elementAttributesProxy = new ElementAttributesProxy(element);
      addLog(element.outerHTML);
    },
    'trap-set': () => {
      elementAttributesProxy.attr1 = 'attr1';
      elementAttributesProxy['data-attr2'] = 'attr2';
      addLog(element.outerHTML);
    },
    'trap-set-invalid': () => {
      try {
        // @ts-ignore for testing
        elementAttributesProxy.attr1 = 0;
      } catch (exception) {
        addLog(`exception: ${(exception as Error).message}`);
      }
    },
    'trap-get': () => {
      addLog(`attr1: ${elementAttributesProxy.attr1}`);
      addLog(`data-attr2: ${elementAttributesProxy['data-attr2']}`);
      addLog(element.outerHTML);
    },
    'trap-deleteproperty': () => {
      try {
        delete elementAttributesProxy.attr1;
        delete elementAttributesProxy['data-attr2'];
        addLog(element.outerHTML);
      } catch (exception) {
        addLog(`exception: ${(exception as Error).message}`);
      }
    },
    'trap-has': () => {
      addLog(`attr1: ${'attr1' in elementAttributesProxy}`);
      addLog(`data-attr2: ${'data-attr2' in elementAttributesProxy}`);
      addLog(element.outerHTML);
    },
    'trap-ownkeys': () => {
      addLog(JSON.stringify(Object.keys(elementAttributesProxy).toSorted()));
      addLog(element.outerHTML);
    },
    'trap-getownpropertydescriptor': () => {
      addLog(`attr1: ${Object.getOwnPropertyDescriptor(elementAttributesProxy, 'attr1') !== undefined}`);
      addLog(`data-attr2: ${Object.getOwnPropertyDescriptor(elementAttributesProxy, 'data-attr2') !== undefined}`);
      addLog(element.outerHTML);
    },
    'object-instance': () => {
      addLog(`object instance of ElementAttributesProxy: ${elementAttributesProxy instanceof ElementAttributesProxy}`);
      addLog(`object instance of Object: ${elementAttributesProxy instanceof Object}`);
    },
  });
}
