import { assertInstanceOf, assertNotInstanceOf, assertStrictEquals } from 'std/testing/asserts.ts';
import dom from './dom.ts';
import createComponent from '../createComponent.ts';
import Component from '../Component.ts';
import ObservableValue from '../ObservableValue.ts';
import Store from '../Store.ts';

interface CustomComponentType extends Component {
  eventHandler: { (): void };
}

Deno.test('createComponent', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  const observableValue = new ObservableValue(0);
  const store = new Store({ prop: 0 });

  let counter = 0;

  const sleep = (time: number) => {
    return new Promise((resolve) => {
      dom.globalThis.setTimeout(resolve, time);
    });
  };

  await t.step('createComponent()', async () => {
    const CustomComponent = createComponent<CustomComponentType>('custom-component', {
      observedAttributes: ['test'],
      init: (context) => {
        context.eventHandler = () => {};
        context.updatedCallback = () => {
          counter++;
        };
      },
      connected: (context) => {
        context.observe(observableValue, store);
        context.content.container.addEventListener('test', context.eventHandler);
      },
      disconnected: (context) => {
        context.unobserve(observableValue, store);
        context.content.container.removeEventListener('test', context.eventHandler);
      },
      template: (context) => {
        return `<span>${context.attr.test}</span><span>${observableValue.get()}</span><span>${store.state.prop}</span>`;
      },
    });

    // This object type is Function instead of Component class
    assertInstanceOf(CustomComponent, Function);
    assertNotInstanceOf(CustomComponent, Component);
    assertStrictEquals(dom.globalThis.customElements.get('custom-component') !== undefined, true);
    assertStrictEquals(counter, 0);

    // Should be rendered correctly
    counter = 0;
    dom.globalThis.document.body.innerHTML = '<custom-component test="0"></custom-component>';
    const customComponent = dom.globalThis.document.querySelector('custom-component') as CustomComponentType;
    const container = customComponent.content.container as ShadowRoot;

    assertStrictEquals(container.innerHTML, '<span>0</span><span>0</span><span>0</span>');
    assertStrictEquals(counter, 1);

    // Should be update correctly
    counter = 0;
    customComponent.attr.test = '1';
    observableValue.set(2);
    store.update({ prop: 3 });
    await sleep(200);

    assertStrictEquals(container.innerHTML, '<span>1</span><span>2</span><span>3</span>');
    assertStrictEquals(counter, 1);
  });

  dom.globalThis.document.body.innerHTML = '';
});
