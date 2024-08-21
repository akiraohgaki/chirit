import { initPage } from './page.ts';
import createcomponentPage from './createcomponent.page.ts';
import componentPage from './component.page.ts';
import customelementPage from './customelement.page.ts';
import elementattributesproxyPage from './elementattributesproxy.page.ts';
import nodestructurePage from './nodestructure.page.ts';
import observablePage from './observable.page.ts';
import observablevaluePage from './observablevalue.page.ts';
import routerPage from './router.page.ts';
import storePage from './store.page.ts';
import webstoragePage from './webstorage.page.ts';

const pages: Record<string, { (): void }> = {
  createcomponentPage,
  componentPage,
  customelementPage,
  elementattributesproxyPage,
  nodestructurePage,
  observablePage,
  observablevaluePage,
  routerPage,
  storePage,
  webstoragePage,
};

initPage();

const pathSegment = location.pathname.split('/')[1];

if (pathSegment && `${pathSegment}Page` in pages) {
  pages[`${pathSegment}Page`]();
}
