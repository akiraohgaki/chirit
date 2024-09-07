import { expect, test } from "@playwright/test";

test.describe("NodeStructure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nodestructure");
  });

  test("content type", async ({ page }) => {
    const code = `
      const { NodeStructure } = this.chirit;

      const host = document.createElement('div');

      const nodeStructure = new NodeStructure(host);

      this.addResult(nodeStructure.host);
      this.addLog(nodeStructure.host.outerHTML);

      const html = '<span>1</span>';
      nodeStructure.update(html);
      this.addResult(nodeStructure.host);
      this.addLog(nodeStructure.host.outerHTML);

      const node = document.createElement('span');
      node.textContent = '2';
      nodeStructure.update(node);
      this.addResult(nodeStructure.host);
      this.addLog(nodeStructure.host.outerHTML);

      const templateForNodeList = document.createElement('template');
      templateForNodeList.innerHTML = '<span>3</span><span>4</span>';
      nodeStructure.update(templateForNodeList.content.childNodes);
      this.addResult(nodeStructure.host);
      this.addLog(nodeStructure.host.outerHTML);

      const templateForDocumentFragment = document.createElement('template');
      templateForDocumentFragment.innerHTML = '<span>5</span><span>6</span>';
      nodeStructure.update(templateForDocumentFragment.content);
      this.addResult(nodeStructure.host);
      this.addLog(nodeStructure.host.outerHTML);
    `;

    const logs = [
      "<div></div>",
      "<div><span>1</span></div>",
      "<div><span>2</span></div>",
      "<div><span>3</span><span>4</span></div>",
      "<div><span>5</span><span>6</span></div>",
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("diff and patch", async ({ page }) => {
    const code = `
      const { NodeStructure } = this.chirit;

      const host = document.createElement('div');
      host.id = 'nodestructure-host';
      this.addResult(host);

      const nodeStructure = new NodeStructure(
        document.querySelector('#nodestructure-host')
      );

      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<span>1</span>');
      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<span>1</span><span>2</span>');
      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<p>a</p><span>1</span><span>2</span>');
      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<p>a</p>');
      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<p title="a">a</p>');
      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<p title="a" class="a">a</p>');
      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<p class="a">a</p>');
      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<p class="b">a</p>');
      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<p class="b">b</p>');
      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<p class="b"><span>c</span></p>');
      this.addLog(nodeStructure.host.outerHTML);
    `;

    const logs = [
      '<div id="nodestructure-host"></div>',
      '<div id="nodestructure-host"><span>1</span></div>',
      '<div id="nodestructure-host"><span>1</span><span>2</span></div>',
      '<div id="nodestructure-host"><p>a</p><span>1</span><span>2</span></div>',
      '<div id="nodestructure-host"><p>a</p></div>',
      '<div id="nodestructure-host"><p title="a">a</p></div>',
      '<div id="nodestructure-host"><p title="a" class="a">a</p></div>',
      '<div id="nodestructure-host"><p class="a">a</p></div>',
      '<div id="nodestructure-host"><p class="b">a</p></div>',
      '<div id="nodestructure-host"><p class="b">b</p></div>',
      '<div id="nodestructure-host"><p class="b"><span>c</span></p></div>',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });

  test("event handler", async ({ page }) => {
    const code = `
      const { NodeStructure } = this.chirit;

      const host = document.createElement('div');
      host.id = 'nodestructure-host';
      this.addResult(host);

      const context = {
        eventHandler: (event) => {
          this.addLog(event.type);
        }
      };

      const nodeStructure = new NodeStructure(
        document.querySelector('#nodestructure-host'),
        context
      );

      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<button onclick="this.eventHandler(event)">click</button>');
      this.addLog(nodeStructure.host.outerHTML);
    `;

    const logs = [
      '<div id="nodestructure-host"></div>',
      '<div id="nodestructure-host"><button>click</button></div>',
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);

    await page.locator("#nodestructure-host > button").click();
    await expect(page.locator('[data-content="log"]')).toHaveText([
      ...logs,
      "click",
    ]);
  });

  test("clone", async ({ page }) => {
    const code = `
      const { NodeStructure } = this.chirit;

      const host = document.createElement('div');

      const nodeStructure = new NodeStructure(host);

      this.addResult(nodeStructure.host);
      this.addLog(nodeStructure.host.outerHTML);

      nodeStructure.update('<span>1</span>');
      this.addResult(nodeStructure.host);
      this.addLog(nodeStructure.host.outerHTML);

      const clone = nodeStructure.clone();
      this.addResult(clone);
      this.addLog(clone.querySelector('span').outerHTML);
    `;

    const logs = [
      "<div></div>",
      "<div><span>1</span></div>",
      "<span>1</span>",
    ];

    console.log(code);
    await page.locator('[data-content="code"]').fill(code);
    await page.locator('[data-action="runCode"]').click();
    await expect(page.locator('[data-content="log"]')).toHaveText(logs);
  });
});
