import { expect, test } from '@playwright/test';

test.describe('/elementattributesproxy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/elementattributesproxy');

    await page.locator('[data-action="init"]').click();
  });

  test('Initialization', async ({ page }) => {
    await expect(page.locator('[data-log]')).toHaveText([
      'init',
      '<div></div>',
    ]);
  });

  test('Traps', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="trap-set"]').click();
    await page.locator('[data-action="trap-set-invalid"]').click();
    await page.locator('[data-action="trap-get"]').click();
    await page.locator('[data-action="trap-has"]').click();
    await page.locator('[data-action="trap-ownkeys"]').click();
    await page.locator('[data-action="trap-getownpropertydescriptor"]').click();
    await page.locator('[data-action="trap-deleteproperty"]').click();
    await page.locator('[data-action="trap-deleteproperty"]').click();
    await page.locator('[data-action="trap-get"]').click();
    await page.locator('[data-action="trap-has"]').click();
    await page.locator('[data-action="trap-ownkeys"]').click();
    await page.locator('[data-action="trap-getownpropertydescriptor"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'trap-set',
      '<div attr1="attr1" data-attr2="attr2"></div>',
      'trap-set-invalid',
      /exception: .+/,
      'trap-get',
      'attr1: attr1',
      'data-attr2: attr2',
      '<div attr1="attr1" data-attr2="attr2"></div>',
      'trap-has',
      'attr1: true',
      'data-attr2: true',
      '<div attr1="attr1" data-attr2="attr2"></div>',
      'trap-ownkeys',
      JSON.stringify(['attr1', 'data-attr2']),
      '<div attr1="attr1" data-attr2="attr2"></div>',
      'trap-getownpropertydescriptor',
      'attr1: true',
      'data-attr2: true',
      '<div attr1="attr1" data-attr2="attr2"></div>',
      'trap-deleteproperty',
      '<div></div>',
      'trap-deleteproperty',
      /exception: .+/,
      'trap-get',
      'attr1: undefined',
      'data-attr2: undefined',
      '<div></div>',
      'trap-has',
      'attr1: false',
      'data-attr2: false',
      '<div></div>',
      'trap-ownkeys',
      JSON.stringify([]),
      '<div></div>',
      'trap-getownpropertydescriptor',
      'attr1: false',
      'data-attr2: false',
      '<div></div>',
    ]);
  });

  test('Object instance', async ({ page }) => {
    await page.locator('[data-action="clear-log"]').click();

    await page.locator('[data-action="object-instance"]').click();

    await expect(page.locator('[data-log]')).toHaveText([
      'object-instance',
      'object instance of ElementAttributesProxy: false',
      'object instance of Object: true',
    ]);
  });
});
