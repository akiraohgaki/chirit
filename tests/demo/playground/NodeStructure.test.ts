import { assert, assertEquals, assertInstanceOf, assertStrictEquals, assertThrows } from '@std/assert';

import { NodeStructure } from '../../../mod.ts';

import { Playground } from './Playground.ts';

class TestElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
}

customElements.define('test-element', TestElement);

await Playground.test('NodeStructure', async (t) => {
  const testElement = document.createElement('test-element');
  Playground.preview.set(testElement);

  let nodeStructure: NodeStructure<ShadowRoot>;

  await t.step('constructor()', () => {
    nodeStructure = new NodeStructure(testElement.shadowRoot as ShadowRoot);

    assert(nodeStructure);
  });

  await t.step('host', () => {
    assertStrictEquals(nodeStructure.host, testElement.shadowRoot);
  });

  await t.step('adoptStyles()', () => {
    const style = ':host { font-size: 140%; }';

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(':host { color: red; }');

    assertEquals(Array.from(nodeStructure.host.adoptedStyleSheets).length, 0);

    nodeStructure.adoptStyles(style);

    assertEquals(Array.from(nodeStructure.host.adoptedStyleSheets).length, 1);

    nodeStructure.adoptStyles(sheet);

    assertEquals(Array.from(nodeStructure.host.adoptedStyleSheets).length, 1);

    nodeStructure.adoptStyles([style, sheet]);

    assertEquals(Array.from(nodeStructure.host.adoptedStyleSheets).length, 2);

    nodeStructure.adoptStyles([...nodeStructure.host.adoptedStyleSheets, style, sheet]);

    assertEquals(Array.from(nodeStructure.host.adoptedStyleSheets).length, 4);
  });

  await t.step('update()', () => {
    const html = '<span>1</span>';

    const node = document.createElement('span');
    node.textContent = '2';

    const templateForNodeList = document.createElement('template');
    templateForNodeList.innerHTML = '<span>3</span><span>4</span>';

    const templateForDocumentFragment = document.createElement('template');
    templateForDocumentFragment.innerHTML = '<span>5</span><span>6</span>';

    assertEquals(testElement.shadowRoot?.innerHTML, '');

    nodeStructure.update(html);

    assertEquals(testElement.shadowRoot?.innerHTML, '<span>1</span>');

    nodeStructure.update(node);

    assertEquals(testElement.shadowRoot?.innerHTML, '<span>2</span>');

    nodeStructure.update(templateForNodeList.content.childNodes);

    assertEquals(testElement.shadowRoot?.innerHTML, '<span>3</span><span>4</span>');

    nodeStructure.update(templateForDocumentFragment.content);

    assertEquals(testElement.shadowRoot?.innerHTML, '<span>5</span><span>6</span>');
  });

  await t.step('clone()', () => {
    nodeStructure.update('<span>1</span>');

    const fragment = nodeStructure.clone();

    assertInstanceOf(fragment, DocumentFragment);
    assertEquals(fragment.querySelector('span')?.outerHTML, '<span>1</span>');
  });
});

await Playground.test('DOM management', async (t) => {
  const testElement = document.createElement('test-element');
  Playground.preview.set(testElement);

  let eventType = '';
  const context = {
    eventHandler: (event: Event) => {
      eventType = event.type;
    },
  };

  const nodeStructure = new NodeStructure(testElement.shadowRoot as ShadowRoot, context);

  // To delayed execution to check DOM changes in DevTools.
  const sleepTime = 0; // 3000

  await t.step('DOM manipulation', async () => {
    await Playground.sleep(sleepTime);

    // Add node.
    nodeStructure.update('<span>1</span>');

    assertEquals(testElement.shadowRoot?.innerHTML, '<span>1</span>');

    await Playground.sleep(sleepTime);

    // Add node to last.
    nodeStructure.update('<span>1</span><span>2</span>');

    assertEquals(testElement.shadowRoot?.innerHTML, '<span>1</span><span>2</span>');

    await Playground.sleep(sleepTime);

    // Add node to first.
    nodeStructure.update('<p>a</p><span>1</span><span>2</span>');

    assertEquals(testElement.shadowRoot?.innerHTML, '<p>a</p><span>1</span><span>2</span>');

    await Playground.sleep(sleepTime);

    // Remove node.
    nodeStructure.update('<p>a</p>');

    assertEquals(testElement.shadowRoot?.innerHTML, '<p>a</p>');

    await Playground.sleep(sleepTime);

    // Add attribute.
    nodeStructure.update('<p title="a">a</p>');

    assertEquals(testElement.shadowRoot?.innerHTML, '<p title="a">a</p>');

    await Playground.sleep(sleepTime);

    // Add attribute.
    nodeStructure.update('<p title="a" class="a">a</p>');

    assertEquals(testElement.shadowRoot?.innerHTML, '<p title="a" class="a">a</p>');

    await Playground.sleep(sleepTime);

    // Remove attribute.
    nodeStructure.update('<p class="a">a</p>');

    assertEquals(testElement.shadowRoot?.innerHTML, '<p class="a">a</p>');

    await Playground.sleep(sleepTime);

    // Change attribute.
    nodeStructure.update('<p class="b">a</p>');

    assertEquals(testElement.shadowRoot?.innerHTML, '<p class="b">a</p>');

    await Playground.sleep(sleepTime);

    // Change child node.
    nodeStructure.update('<p class="b">b</p>');

    assertEquals(testElement.shadowRoot?.innerHTML, '<p class="b">b</p>');

    await Playground.sleep(sleepTime);

    // Change child node.
    nodeStructure.update('<p class="b"><span>c</span></p>');

    assertEquals(testElement.shadowRoot?.innerHTML, '<p class="b"><span>c</span></p>');

    await Playground.sleep(sleepTime);
  });

  await t.step('event binding', async () => {
    await Playground.sleep(sleepTime);

    const button1 = '<button data-onevent="true" onclick="this.eventHandler(event)">a</button>';
    const button2 = '<button data-onevent="false">b</button>';

    nodeStructure.update(button1);
    (testElement.shadowRoot?.querySelector('button[data-onevent="true"]') as HTMLButtonElement).click();

    assertEquals(eventType, 'click');

    await Playground.sleep(sleepTime);

    eventType = '';

    // Node changed, the event binding should be reset.
    nodeStructure.update(button2 + button1);
    (testElement.shadowRoot?.querySelector('button[data-onevent="true"]') as HTMLButtonElement).click();

    assertEquals(eventType, 'click');

    await Playground.sleep(sleepTime);
  });

  // Makes Element object in a separate scope,
  // to ensure that object are cleared by garbage collection.
  function createNodeStructureForGC(): NodeStructure<Element> {
    const element = document.createElement('div');
    element.id = 'gc';

    const nodeStructure = new NodeStructure(element);

    element.remove();

    return nodeStructure;
  }

  await t.step('garbage collection', async () => {
    if (navigator.userAgent.search('Firefox') !== -1) {
      // GC is slow in Firefox, so skip the check.
      return;
    }

    const nodeStructure = createNodeStructureForGC();

    await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        try {
          if (nodeStructure.host.id) {
            void 0;
          }
        } catch (exception) {
          clearInterval(intervalId);
          resolve(exception);
        }
      }, 1000);
    });

    assertThrows(() => nodeStructure.host.id, Error);
  });
});
