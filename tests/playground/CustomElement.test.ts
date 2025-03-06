import { Playground } from '@akiraohgaki/devsrv/playground';
import { assert, assertEquals, assertInstanceOf } from '@std/assert';

import { CustomElement } from '../../mod.ts';

const values: Array<string> = [];
let isRenderError = false;
let isUpdatedCallbackError = false;

class TestElement extends CustomElement {
  static override get observedAttributes(): Array<string> {
    values.push('observedAttributes');
    return ['attr1', ...super.observedAttributes];
  }

  constructor() {
    values.push('constructor()');
    super();
  }

  override attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
    namespace: string | null,
  ): void {
    values.push('attributeChangedCallback()');
    super.attributeChangedCallback(name, oldValue, newValue, namespace);
  }

  override connectedCallback(): void {
    values.push('connectedCallback()');
    super.connectedCallback();
  }

  override disconnectedCallback(): void {
    values.push('disconnectedCallback()');
    super.disconnectedCallback();
  }

  override adoptedCallback(oldDocument: Document, newDocument: Document): void {
    values.push('adoptedCallback()');
    super.adoptedCallback(oldDocument, newDocument);
  }

  override update() {
    values.push('update()');
    return super.update();
  }

  override updateSync() {
    values.push('updateSync()');
    super.updateSync();
  }

  override render() {
    values.push('render()');
    if (isRenderError) {
      throw new Error('error');
    }
    super.render();
    this.innerHTML = `<span>attr1:${this.getAttribute('attr1') ?? ''}</span>` +
      `<span>attr2:${this.getAttribute('attr2') ?? ''}</span>`;
  }

  override updatedCallback() {
    values.push('updatedCallback()');
    if (isUpdatedCallbackError) {
      throw new Error('error');
    }
    super.updatedCallback();
  }

  override errorCallback(exception: unknown) {
    values.push('errorCallback()');
    super.errorCallback(exception);
  }
}

await Playground.test('CustomElement', async (t) => {
  let testElement: TestElement;

  await t.step('observedAttributes()', () => {
    assertEquals(TestElement.observedAttributes, ['attr1']);
    assertEquals(values.splice(0), ['observedAttributes']);
  });

  await t.step('define()', () => {
    TestElement.define('test-element');

    assert(customElements.get('test-element'));
    assertEquals(values.splice(0), ['observedAttributes']);
  });

  await t.step('constructor()', () => {
    testElement = new TestElement();

    assert(testElement);
    assertInstanceOf(testElement, HTMLElement);
    assertEquals(values.splice(0), ['constructor()']);
  });

  await t.step('updateCounter', () => {
    assertEquals(testElement.updateCounter, 0);
  });
});

await Playground.test('Custom element lifecycle callbacks', async (t) => {
  let testElement: TestElement;

  await t.step('created an instance of the element', () => {
    testElement = document.createElement('test-element') as TestElement;

    assertInstanceOf(testElement, TestElement);
    assertEquals(values.splice(0), ['constructor()']);
  });

  await t.step('connected to parent element', () => {
    Playground.preview.set('<test-element></test-element>');
    testElement = Playground.preview.get('test-element') as TestElement;

    assertEquals(values.splice(0), [
      'constructor()',
      'connectedCallback()',
      'updateSync()',
      'render()',
      'updatedCallback()',
    ]);
  });

  await t.step('disconnected from parent element', () => {
    testElement.remove();

    assertEquals(values.splice(0), ['disconnectedCallback()']);
  });

  await t.step('transferred element to another document', async () => {
    await t.step('to current document', () => {
      testElement = document.createElement('test-element') as TestElement;
      Playground.preview.set(testElement);

      assertEquals(values.splice(0), [
        'constructor()',
        'adoptedCallback()',
        'adoptedCallback()',
        'connectedCallback()',
        'updateSync()',
        'render()',
        'updatedCallback()',
      ]);
    });

    await t.step('to iframe document', async () => {
      const iframe = document.createElement('iframe');
      iframe.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';
      Playground.preview.set(iframe);

      iframe.contentWindow?.document.body.appendChild(testElement);

      await Playground.sleep(100);

      let expected = [
        'disconnectedCallback()',
        'adoptedCallback()',
        'connectedCallback()',
        'update()',
        'updateSync()',
        'render()',
        'updatedCallback()',
      ];

      if (navigator.userAgent.search('Firefox') !== -1) {
        // Because the behavior is different in Firefox.
        expected = [
          'disconnectedCallback()',
          'adoptedCallback()',
          'connectedCallback()',
        ];
      }

      assertEquals(values.splice(0), expected);
    });
  });

  await t.step('attribute changed', async () => {
    Playground.preview.clear();
    values.splice(0);

    await t.step('initial changed', () => {
      Playground.preview.set('<test-element attr1="1" attr2="2"></test-element>');
      testElement = Playground.preview.get('test-element') as TestElement;

      assertEquals(values.splice(0), [
        'constructor()',
        'attributeChangedCallback()',
        'connectedCallback()',
        'updateSync()',
        'render()',
        'updatedCallback()',
      ]);
      assertEquals(
        testElement.outerHTML,
        '<test-element attr1="1" attr2="2"><span>attr1:1</span><span>attr2:2</span></test-element>',
      );
    });

    await t.step('changed to another value', async () => {
      testElement.setAttribute('attr1', 'a');

      await Playground.sleep(100);

      assertEquals(values.splice(0), [
        'attributeChangedCallback()',
        'update()',
        'updateSync()',
        'render()',
        'updatedCallback()',
      ]);
      assertEquals(
        testElement.outerHTML,
        '<test-element attr1="a" attr2="2"><span>attr1:a</span><span>attr2:2</span></test-element>',
      );
    });

    await t.step('changed but same value', async () => {
      testElement.setAttribute('attr1', 'a');

      await Playground.sleep(100);

      assertEquals(values.splice(0), ['attributeChangedCallback()']);
      assertEquals(
        testElement.outerHTML,
        '<test-element attr1="a" attr2="2"><span>attr1:a</span><span>attr2:2</span></test-element>',
      );
    });

    await t.step('changed but not an observed attribute', async () => {
      testElement.setAttribute('attr2', 'x');

      await Playground.sleep(100);

      assertEquals(values.splice(0), []);
      assertEquals(
        testElement.outerHTML,
        '<test-element attr1="a" attr2="x"><span>attr1:a</span><span>attr2:2</span></test-element>',
      );
    });
  });

  await t.step('update', async () => {
    Playground.preview.clear();
    values.splice(0);

    await t.step('first time synchronous update', () => {
      Playground.preview.set('<test-element attr1="1" attr2="2"></test-element>');
      testElement = Playground.preview.get('test-element') as TestElement;

      assertEquals(testElement.updateCounter, 1);
      assertEquals(values.splice(0), [
        'constructor()',
        'attributeChangedCallback()',
        'connectedCallback()',
        'updateSync()',
        'render()',
        'updatedCallback()',
      ]);
    });

    await t.step('asynchronous updates after the first time', async () => {
      testElement.setAttribute('attr1', 'a');

      await Playground.sleep(100);

      assertEquals(testElement.updateCounter, 2);
      assertEquals(values.splice(0), [
        'attributeChangedCallback()',
        'update()',
        'updateSync()',
        'render()',
        'updatedCallback()',
      ]);
    });

    await t.step('debounced updates', async () => {
      testElement.setAttribute('attr1', 'b');
      testElement.setAttribute('attr1', 'c');
      testElement.setAttribute('attr1', 'd');
      testElement.setAttribute('attr1', 'e');
      testElement.setAttribute('attr1', 'f');

      await Playground.sleep(100);

      assertEquals(testElement.updateCounter, 3);
      assertEquals(values.splice(0), [
        'attributeChangedCallback()',
        'update()',
        'attributeChangedCallback()',
        'update()',
        'attributeChangedCallback()',
        'update()',
        'attributeChangedCallback()',
        'update()',
        'attributeChangedCallback()',
        'update()',
        'updateSync()',
        'render()',
        'updatedCallback()',
      ]);
    });
  });

  await t.step('error handling', async () => {
    Playground.preview.clear();
    values.splice(0);

    Playground.preview.set('<test-element attr1="1" attr2="2"></test-element>');
    testElement = Playground.preview.get('test-element') as TestElement;

    await Playground.sleep(100);

    values.splice(0);

    await t.step('error in render()', async () => {
      isRenderError = true;
      isUpdatedCallbackError = false;

      testElement.setAttribute('attr1', 'a');

      await Playground.sleep(100);

      assertEquals(values.splice(0), [
        'attributeChangedCallback()',
        'update()',
        'updateSync()',
        'render()',
        'errorCallback()',
      ]);
    });

    await t.step('error in updatedCallback()', async () => {
      isRenderError = false;
      isUpdatedCallbackError = true;

      testElement.setAttribute('attr1', 'b');

      await Playground.sleep(100);

      assertEquals(values.splice(0), [
        'attributeChangedCallback()',
        'update()',
        'updateSync()',
        'render()',
        'updatedCallback()',
        'errorCallback()',
      ]);
    });
  });
});
