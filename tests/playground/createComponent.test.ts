import { Playground } from '@akiraohgaki/devsrv/playground';
import { assert, assertEquals, assertInstanceOf, assertNotInstanceOf } from '@std/assert';

import { Component, createComponent } from '../../mod.ts';

class BaseComponent extends Component<{
  attrs: { prop1: string };
  props: { prop1: number };
  content: ShadowRoot;
}> {
  get delegatesFocus(): boolean {
    return this.content.delegatesFocus;
  }

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

    assert(testComponent2.delegatesFocus);
  });

  await t.step('lifecycle callbacks', async () => {
    const values: Array<string> = [];

    createComponent('test-component-3', {
      base: BaseComponent,
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
        return `<span>prop1:${context.props.prop1};delegatesFocus:${context.delegatesFocus}</span>`;
      },
    });

    const testComponent3 = document.createElement('test-component-3') as BaseComponent;

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
    assertEquals(testComponent3.content.innerHTML, '<span>prop1:1;delegatesFocus:true</span>');
  });
});
