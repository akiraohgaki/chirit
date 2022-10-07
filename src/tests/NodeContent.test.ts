import { assertInstanceOf, assertStrictEquals } from 'https://deno.land/std/testing/asserts.ts';
import util from './util.ts';
import NodeContent from '../NodeContent.ts';

Deno.test('NodeContent', { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  let nodeContent: NodeContent<Element>;

  const element = util.globalThis.document.createElement('div');

  let counter = 0;

  const context = {
    handleClick: (event: MouseEvent) => {
      counter++;
      console.log(counter, event);
    },
  };

  await t.step('constructor()', () => {
    nodeContent = new NodeContent(element, context);

    assertInstanceOf(nodeContent, NodeContent);
    assertStrictEquals(nodeContent.container, element);
  });

  await t.step('update()', () => {
    const template = util.globalThis.document.createElement('template');

    template.innerHTML = '<ul><li>1</li></ul>';
    nodeContent.update(template.innerHTML);

    assertStrictEquals(
      nodeContent.container.innerHTML,
      '<ul><li>1</li></ul>',
    );

    template.innerHTML = '<ul><li>2</li></ul>';
    nodeContent.update(template.content);

    assertStrictEquals(
      nodeContent.container.innerHTML,
      '<ul><li>2</li></ul>',
    );

    template.innerHTML = '<ul><li>3</li></ul>';
    nodeContent.update(template.content.querySelector('ul') as Node);

    assertStrictEquals(
      nodeContent.container.innerHTML,
      '<ul><li>3</li></ul>',
    );

    template.innerHTML = '<ul><li>1</li><li>2</li><li>3</li></ul>';
    nodeContent.update(template.content.querySelectorAll('li'));

    assertStrictEquals(
      nodeContent.container.innerHTML,
      '<li>1</li><li>2</li><li>3</li>',
    );

    template.innerHTML = '<button>test</button>';
    nodeContent.update(template.innerHTML);
    const buttonElement = nodeContent.container.querySelector('button') as HTMLButtonElement;
    buttonElement.onclick = () => {}; // test environment workaround

    template.innerHTML = '<button onclick="this.handleClick(event)">test</button>';
    nodeContent.update(template.innerHTML);
    buttonElement.click();

    assertStrictEquals(
      nodeContent.container.innerHTML,
      '<button>test</button>',
    );
    assertStrictEquals(counter, 1);
  });

  await t.step('clone()', () => {
    const documentFragment = nodeContent.clone();

    assertStrictEquals(documentFragment.querySelector('button')?.textContent, 'test');
  });
});
