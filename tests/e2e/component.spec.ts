import { expect, test } from '@playwright/test';

test.describe('Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component');
  });

  test('inherited features', async ({ page }) => {
    const code = `
      const { Component, CustomElement, NodeStructure } = this.chirit;

      class TestComponent extends Component {
        styles() {
          return 'span { color: red; }';
        }
        template() {
          return '<span>adoptedStyleSheets:' + Array.from(this.content.adoptedStyleSheets).length + '</span>';
        }
      }

      TestComponent.define('test-component');

      this.addResult('<test-component attr0="0"></test-component>');

      const testComponent = document.querySelector('test-component');
      this.addLog(testComponent.outerHTML);
      this.addLog(testComponent.content.innerHTML);

      this.addLog(testComponent instanceof Component);
      this.addLog(testComponent instanceof CustomElement);
      this.addLog(testComponent.attr.attr0 === '0'); // ElementAttributesProxy
      this.addLog(testComponent.structure instanceof NodeStructure);
      this.addLog(testComponent.content === testComponent.structure.host);
    `;

    const logs = [
      '<test-component attr0="0"></test-component>',
      '<span>adoptedStyleSheets:1</span>',
      'true',
      'true',
      'true',
      'true',
      'true',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('rendering', async ({ page }) => {
    const code = `
      const { Component } = this.chirit;
      const addLog = this.addLog;

      class TestComponent extends Component {
        styles() {
          addLog('styles');
          return 'span { color: red; }';
        }
        template() {
          addLog('template');
          return '<span>adoptedStyleSheets:' + Array.from(this.content.adoptedStyleSheets).length + '</span>';
        }
      }

      TestComponent.define('test-component');

      this.addResult('<test-component></test-component>');

      const testComponent = document.querySelector('test-component');
      this.addLog(testComponent.outerHTML);
      this.addLog(testComponent.content.innerHTML);

      testComponent.render();

      this.addLog(testComponent.outerHTML);
      this.addLog(testComponent.content.innerHTML);
    `;

    const logs = [
      'styles',
      'template',
      '<test-component></test-component>',
      '<span>adoptedStyleSheets:1</span>',
      'template',
      '<test-component></test-component>',
      '<span>adoptedStyleSheets:1</span>',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('content container', async ({ page }) => {
    const code = `
      const { Component } = this.chirit;

      class TestComponent1 extends Component {}

      TestComponent1.define('test-component1');

      this.addResult('<test-component1></test-component1>');

      const testComponent1 = document.querySelector('test-component1');
      this.addLog(testComponent1.outerHTML);

      this.addLog(testComponent1.content instanceof ShadowRoot);

      class TestComponent2 extends Component {
        createContentContainer() {
          const container = document.createElement('div');
          this.appendChild(container);
          return container;
        }
      }

      TestComponent2.define('test-component2');

      this.addResult('<test-component2></test-component2>');

      const testComponent2 = document.querySelector('test-component2');
      this.addLog(testComponent2.outerHTML);

      this.addLog(testComponent2.content instanceof HTMLDivElement);
    `;

    const logs = [
      '<test-component1></test-component1>',
      'true',
      '<test-component2><div></div></test-component2>',
      'true',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test('event handling', async ({ page }) => {
    const code = `
      const { Component } = this.chirit;

      class TestComponent extends Component {
        eventHandler(event) {
          this.dispatch('test-component-event', { event });
        }

        template() {
          return '<button onclick="this.eventHandler(event)">click</button>';
        }
      }

      TestComponent.define('test-component');

      this.addResult('<test-component></test-component>');

      const testComponent = document.querySelector('test-component');
      this.addLog(testComponent.outerHTML);

      document.body.addEventListener('test-component-event', (event) => {
        this.addLog(event.detail.event.type);
      });
    `;

    const logs = [
      '<test-component></test-component>',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);

    await page.locator('test-component').click();
    await expect(page.locator('[data-content="log"]')).toHaveText([
      ...logs,
      'click',
    ]);
  });

  test('state management', async ({ page }) => {
    const code = `
      const { Component, State } = this.chirit;

      const state1 = new State(0);
      const state2 = new State(0);

      class TestComponent extends Component {
        constructor() {
          super();
          this.observe(state1, state2);
        }
        template() {
          return '<span>'
            + 'state1:' + state1.get() + ';'
            + 'state2:' + state2.get() + ';'
            + '</span>';
        }
      }

      TestComponent.define('test-component');

      this.addResult('<test-component></test-component>');

      const testComponent = document.querySelector('test-component');
      this.addLog(testComponent.outerHTML);
      this.addLog(testComponent.content.innerHTML);

      state1.set(1);
      state2.set(1);
      await this.wait(100);
      this.addLog(testComponent.content.innerHTML);

      testComponent.unobserve(state1, state2);
      state1.set(2);
      state2.set(2);
      await this.wait(100);
      this.addLog(testComponent.content.innerHTML);
    `;

    const logs = [
      '<test-component></test-component>',
      '<span>state1:0;state2:0;</span>',
      '<span>state1:1;state2:1;</span>',
      '<span>state1:1;state2:1;</span>',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
