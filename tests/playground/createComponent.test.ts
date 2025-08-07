import { Playground } from '@akiraohgaki/devsrv/playground';
import { assert, assertEquals, assertInstanceOf, assertNotInstanceOf } from '@std/assert';

import { Component, createComponent } from '../../mod.ts';

class BaseComponent extends Component {
  override createContentContainer(): ShadowRoot {
    return this.attachShadow({ mode: 'open', delegatesFocus: true });
  }
}

await Playground.test('createComponent()', async (t) => {
  await t.step('custom element definition', () => {
    const TestComponent1 = createComponent('test-component-1');

    assert(customElements.get('test-component-1'));
    assertNotInstanceOf(TestComponent1, Component);
    assertInstanceOf(TestComponent1, Function);
  });

  await t.step('specific base class', () => {
    createComponent('test-component-2', { base: BaseComponent });

    const testComponent2 = document.createElement('test-component-2') as BaseComponent;

    assert((testComponent2.content as ShadowRoot).delegatesFocus);
  });

  await t.step('lifecycle callbacks', async () => {
    const values: Array<string> = [];

    createComponent('test-component-3', {
      properties: {
        prop1: { value: 0 },
      },
      init: (_context) => {
        values.push('init()');
      },
      connected: (_context) => {
        values.push('connected()');
      },
      disconnected: (_context) => {
        values.push('disconnected()');
      },
      styles: (_context) => {
        values.push('styles()');
        return ':host { color: red; }';
      },
      template: (context) => {
        values.push('template()');
        return '<span>prop1:' + context.props.prop1 + '</span>';
      },
    });

    const testComponent3 = document.createElement('test-component-3') as Component;

    testComponent3.attrs.prop1 = '1';

    await Playground.sleep(100);

    Playground.preview.set(testComponent3);

    testComponent3.remove();

    assertEquals(values.splice(0), [
      'init()',
      'styles()',
      'template()',
      'connected()',
      'disconnected()',
    ]);
    assertEquals((testComponent3.content as ShadowRoot).innerHTML, '<span>prop1:1</span>');
  });
});
