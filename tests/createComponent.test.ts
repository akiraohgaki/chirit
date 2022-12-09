import { assertInstanceOf, assertNotInstanceOf, assertStrictEquals } from 'std/testing/asserts.ts';
import dom from './dom.ts';
import createComponent from '../src/createComponent.ts';
import Component from '../src/Component.ts';
import ObservableValue from '../src/ObservableValue.ts';

Deno.test('createComponent', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  const observableValue = new ObservableValue(0);

  let counter = 0;

  const sleep = (time: number) => {
    return new Promise((resolve) => {
      dom.globalThis.setTimeout(resolve, time);
    });
  };

  await t.step('createComponent()', async () => {
    const CustomComponent = createComponent('custom-component', {
      observedAttributes: ['test'],
      observedObjects: [observableValue],
      init: (context) => {
        context.updatedCallback = () => {
          counter++;
          console.log(counter);
        };
      },
      template: (context) => {
        return `<span>${context.attrs.test}</span><span>${observableValue.get()}</span>`;
      },
    });

    dom.globalThis.document.body.innerHTML = '<custom-component test="0"></custom-component>';
    const customComponent = dom.globalThis.document.querySelector('custom-component') as Component;
    const container = customComponent.content.container as ShadowRoot;

    // This component type is Function instead of Component class
    assertInstanceOf(CustomComponent, Function);
    assertNotInstanceOf(CustomComponent, Component);
    assertStrictEquals(dom.globalThis.customElements.get('custom-component') !== undefined, true);
    assertStrictEquals(container.innerHTML, '<span>0</span><span>0</span>');
    assertStrictEquals(counter, 1);

    // Should be update correctly
    counter = 0;
    customComponent.attrs.test = '1';
    observableValue.set(2);
    await sleep(200);

    assertStrictEquals(container.innerHTML, '<span>1</span><span>2</span>');
    assertStrictEquals(counter, 1);
  });
});
