import { assertStrictEquals } from '@std/assert';
import dom from './dom.ts';
import { Component } from '../../mod.ts';

const document = dom.globalThis.document;

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class TestComponent extends Component {
  static override get observedAttributes(): Array<string> {
    return ['attr1'];
  }
  override template(): string {
    return `<span>${this.attr.attr1}</span>`;
  }
}

TestComponent.define('test-component');

Deno.test('DOM in Deno', async (t) => {
  await t.step('Component initialization', () => {
    document.body.innerHTML = '<test-component attr1="1"></test-component>';
    const testComponent = document.querySelector('test-component') as TestComponent;

    assertStrictEquals(
      testComponent.outerHTML,
      '<test-component attr1="1"></test-component>',
    );
    assertStrictEquals(
      testComponent.shadowRoot?.innerHTML,
      '<span>1</span>',
    );
  });

  await t.step('Component updating', async () => {
    const testComponent = document.querySelector('test-component') as TestComponent;
    testComponent.attr.attr1 = 'a';

    await wait(200);

    assertStrictEquals(
      testComponent.outerHTML,
      '<test-component attr1="a"></test-component>',
    );
    assertStrictEquals(
      testComponent.shadowRoot?.innerHTML,
      '<span>a</span>',
    );
  });
});
