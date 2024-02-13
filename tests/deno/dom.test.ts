import { assertStrictEquals } from 'std/assert/mod.ts';
import dom from './dom.ts';
import { Component } from '../../mod.ts';

const document = dom.globalThis.document;

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

class TestComponent extends Component {
  static override get observedAttributes(): Array<string> {
    return ['attr1'];
  }
  override template(): string {
    return `<p>${this.attr.attr1}</p>`;
  }
}
TestComponent.define('test-component');

Deno.test('DOM in Deno', async (t) => {
  await t.step('Component initialization', () => {
    document.body.innerHTML = '<test-component attr1="attr1"></test-component>';
    const testComponent = document.querySelector('test-component') as TestComponent;

    assertStrictEquals(
      testComponent.outerHTML,
      '<test-component attr1="attr1"></test-component>',
    );
    assertStrictEquals(
      testComponent.shadowRoot?.innerHTML,
      '<p>attr1</p>',
    );
  });

  await t.step('Component updating', async () => {
    const testComponent = document.querySelector('test-component') as TestComponent;
    testComponent.attr.attr1 = 'text';

    await sleep(200);

    assertStrictEquals(
      testComponent.outerHTML,
      '<test-component attr1="text"></test-component>',
    );
    assertStrictEquals(
      testComponent.shadowRoot?.innerHTML,
      '<p>text</p>',
    );
  });
});
