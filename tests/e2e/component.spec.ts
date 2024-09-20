import { expect, test } from "@playwright/test";

test.describe("Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/component.playground");
  });

  test("inherited features", async ({ page, baseURL }) => {
    const code = `
      import { Component, CustomElement, NodeStructure } from '${baseURL}/mod.bundle.js';

      class TestComponent extends Component {
        styles() {
          return 'span { color: red; }';
        }
        template() {
          return '<span>adoptedStyleSheets:' + Array.from(this.content.adoptedStyleSheets).length + '</span>';
        }
      }

      TestComponent.define('test-component');

      playground.content.set('<test-component attr1="1"></test-component>');

      const testComponent = playground.content.get().querySelector('test-component');

      playground.logs.add(testComponent.outerHTML);
      playground.logs.add(testComponent.content.innerHTML);
      playground.logs.add(testComponent instanceof Component);
      playground.logs.add(testComponent instanceof CustomElement);
      playground.logs.add(testComponent.attr.attr1 === '1'); // ElementAttributesProxy
      playground.logs.add(testComponent.structure instanceof NodeStructure);
      playground.logs.add(testComponent.content === testComponent.structure.host);
    `;

    const logs = [
      '<test-component attr1="1"></test-component>',
      "<span>adoptedStyleSheets:1</span>",
      "true",
      "true",
      "true",
      "true",
      "true",
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("rendering", async ({ page, baseURL }) => {
    const code = `
      import { Component } from '${baseURL}/mod.bundle.js';

      class TestComponent extends Component {
        styles() {
          playground.logs.add('styles');
          return 'span { color: red; }';
        }
        template() {
          playground.logs.add('template');
          return '<span>adoptedStyleSheets:' + Array.from(this.content.adoptedStyleSheets).length + '</span>';
        }
      }

      TestComponent.define('test-component');

      playground.content.set('<test-component></test-component>');

      const testComponent = playground.content.get().querySelector('test-component');

      playground.logs.add(testComponent.outerHTML);
      playground.logs.add(testComponent.content.innerHTML);

      testComponent.render();

      playground.logs.add(testComponent.content.innerHTML);
    `;

    const logs = [
      "styles",
      "template",
      "<test-component></test-component>",
      "<span>adoptedStyleSheets:1</span>",
      "template",
      "<span>adoptedStyleSheets:1</span>",
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("content container", async ({ page, baseURL }) => {
    const code = `
      import { Component } from '${baseURL}/mod.bundle.js';

      class TestComponent1 extends Component {}

      TestComponent1.define('test-component1');

      playground.content.set('<test-component1></test-component1>');

      const testComponent1 = playground.content.get().querySelector('test-component1');

      playground.logs.add(testComponent1.outerHTML);
      playground.logs.add(testComponent1.content instanceof ShadowRoot);

      class TestComponent2 extends Component {
        createContentContainer() {
          const container = document.createElement('div');
          this.appendChild(container);
          return container;
        }
      }

      TestComponent2.define('test-component2');

      playground.content.set('<test-component2></test-component2>');

      const testComponent2 = playground.content.get().querySelector('test-component2');

      playground.logs.add(testComponent2.outerHTML);
      playground.logs.add(testComponent2.content instanceof HTMLDivElement);
    `;

    const logs = [
      "<test-component1></test-component1>",
      "true",
      "<test-component2><div></div></test-component2>",
      "true",
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("event handling", async ({ page, baseURL }) => {
    const code = `
      import { Component } from '${baseURL}/mod.bundle.js';

      class TestComponent extends Component {
        eventHandler(event) {
          this.dispatch('test-component-event', { event });
        }

        template() {
          return '<button onclick="this.eventHandler(event)">click me</button>';
        }
      }

      TestComponent.define('test-component');

      playground.content.set('<test-component></test-component>');

      const testComponent = playground.content.get().querySelector('test-component');

      playground.logs.add(testComponent.outerHTML);
      playground.logs.add(testComponent.content.innerHTML);

      document.body.addEventListener('test-component-event', (event) => {
        playground.logs.add(event.detail.event.type);
      });
    `;

    const logs = [
      "<test-component></test-component>",
      "<button>click me</button>",
    ];

    const logsAfterComponentClick = [
      "click",
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);

    await page.locator('[data-content="content"] test-component').click();
    await expect(page.locator('[data-content="log"]')).toHaveText([
      ...logs,
      ...logsAfterComponentClick,
    ]);
  });

  test("state management", async ({ page, baseURL }) => {
    const code = `
      import { Component, State } from '${baseURL}/mod.bundle.js';

      const state1 = new State(0);
      const state2 = new State(0);

      class TestComponent extends Component {
        constructor() {
          super();
          this.observe(state1, state2);
        }
        template() {
          return '<span>state1:' + state1.get() + '</span>'
            + '<span>state2:' + state2.get() + '</span>';
        }
      }

      TestComponent.define('test-component');

      playground.content.set('<test-component></test-component>');

      const testComponent = playground.content.get().querySelector('test-component');

      playground.logs.add(testComponent.outerHTML);
      playground.logs.add(testComponent.content.innerHTML);

      state1.set(1);
      state2.set(1);

      await playground.wait(100);

      playground.logs.add(testComponent.content.innerHTML);

      testComponent.unobserve(state1, state2);

      state1.set(2);
      state2.set(2);

      await playground.wait(100);

      playground.logs.add(testComponent.content.innerHTML);
    `;

    const logs = [
      "<test-component></test-component>",
      "<span>state1:0</span><span>state2:0</span>",
      "<span>state1:1</span><span>state2:1</span>",
      "<span>state1:1</span><span>state2:1</span>",
    ];

    console.log(code);
    await page.locator('[data-content="code"] code').fill(code);
    await page.locator('[data-action="code.run"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
