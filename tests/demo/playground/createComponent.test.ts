import { assert, assertEquals, assertInstanceOf, assertNotInstanceOf } from '@std/assert';

import { Component, createComponent } from '../../../mod.ts';

import { Playground } from './Playground.ts';

await Playground.test('createComponent()', async (t) => {
  await t.step('custom element definition', () => {
    const TestComponent = createComponent('test-component');

    assert(customElements.get('test-component'));
    assertNotInstanceOf(TestComponent, Component);
    assertInstanceOf(TestComponent, Function);
  });

  await t.step('specific base component', () => {
    class BaseComponent extends Component {
      override createContentContainer(): ShadowRoot {
        return this.attachShadow({ mode: 'open', delegatesFocus: true });
      }
    }

    createComponent('test-component-2', {
      base: BaseComponent,
    });

    const testComponent2 = document.createElement('test-component-2') as BaseComponent;

    assert((testComponent2.content as ShadowRoot).delegatesFocus);
  });

  await t.step('component lifecycle callbacks', () => {
    const values: Array<string> = [];

    createComponent('test-component-3', {
      observedAttributes: ['attr1'],
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
        return '<span>attr1:' + context.attr.attr1 + '</span>';
      },
    });

    const testComponent3 = document.createElement('test-component-3') as Component;
    testComponent3.attr.attr1 = '1';

    Playground.preview.set(testComponent3);

    Playground.sleep(100);

    testComponent3.remove();

    assertEquals(values.splice(0), [
      'init()',
      'styles()',
      'template()',
      'connected()',
      'disconnected()',
    ]);
    assertEquals(
      (testComponent3.content as ShadowRoot).innerHTML,
      '<span>attr1:1</span>',
    );
  });
});
