import { assertInstanceOf, assertStrictEquals } from 'std/testing/asserts.ts';
import dom from './dom.ts';
import NodeContent from '../NodeContent.ts';

Deno.test('NodeContent', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let nodeContent: NodeContent<Element>;

  let counter = 0;

  const container = dom.globalThis.document.createElement('div');

  const context = {
    handleClick: (event: MouseEvent) => {
      counter++;
      console.log(counter, event.type);
    },
  };

  await t.step('constructor()', () => {
    nodeContent = new NodeContent(container, context);

    assertInstanceOf(nodeContent, NodeContent);
    assertStrictEquals(nodeContent.container, container);
  });

  await t.step('update()', () => {
    const template = dom.globalThis.document.createElement('template');

    // From string
    template.innerHTML = '<ul><li>1</li></ul>';
    nodeContent.update(template.innerHTML);

    const li = nodeContent.container.querySelector('li') as Element;

    assertStrictEquals(
      nodeContent.container.innerHTML,
      '<ul><li>1</li></ul>',
    );
    assertStrictEquals(li.textContent, '1');

    // From DocumentFragment
    template.innerHTML = '<ul><li>2</li></ul>';
    nodeContent.update(template.content);

    assertStrictEquals(
      nodeContent.container.innerHTML,
      '<ul><li>2</li></ul>',
    );
    assertStrictEquals(li.textContent, '2');

    // From Node
    template.innerHTML = '<ul><li>3</li></ul>';
    nodeContent.update(template.content.querySelector('ul') as Node);

    assertStrictEquals(
      nodeContent.container.innerHTML,
      '<ul><li>3</li></ul>',
    );
    assertStrictEquals(li.textContent, '3');

    // From NodeList
    template.innerHTML = '<ul><li>1</li><li>2</li><li>3</li></ul>';
    nodeContent.update(template.content.querySelectorAll('li'));

    assertStrictEquals(
      nodeContent.container.innerHTML,
      '<li>1</li><li>2</li><li>3</li>',
    );
    assertStrictEquals(li.isConnected, false);

    // Test environment workaround for event handler
    template.innerHTML = '<button>test</button>';
    nodeContent.update(template.innerHTML);
    const button = nodeContent.container.querySelector('button') as HTMLButtonElement;
    button.onclick = () => {};

    // on* attribute should not appear in HTML but the function in context should run
    counter = 0;
    template.innerHTML = '<button onclick="this.handleClick(event)">test</button>';
    nodeContent.update(template.innerHTML);
    button.click();

    assertStrictEquals(
      nodeContent.container.innerHTML,
      '<button>test</button>',
    );
    assertStrictEquals(counter, 1);
  });

  await t.step('clone()', () => {
    const documentFragment = nodeContent.clone();

    assertInstanceOf(documentFragment, dom.globalThis.DocumentFragment);
    assertStrictEquals(documentFragment.querySelector('button')?.textContent, 'test');
  });
});
