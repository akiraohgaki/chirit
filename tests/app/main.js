import { initPage } from './page.js';

initPage();

const moduleName = location.pathname.split('/')[1] ?? '';
if (moduleName) {
  const module = await import(`./${moduleName}.page.js`);
  module.default();
}
