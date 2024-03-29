import { initPage } from './page.ts';
import versionPage from './version.page.ts';
import createcomponentPage from './createcomponent.page.ts';
import componentPage from './component.page.ts';
import customelementPage from './customelement.page.ts';
import elementattributesproxyPage from './elementattributesproxy.page.ts';
import nodecontentPage from './nodecontent.page.ts';
import observablePage from './observable.page.ts';
import observablevaluePage from './observablevalue.page.ts';
import routerPage from './router.page.ts';
import storePage from './store.page.ts';
import webstoragePage from './webstorage.page.ts';

const pages: Record<string, { (): void }> = {
  versionPage,
  createcomponentPage,
  componentPage,
  customelementPage,
  elementattributesproxyPage,
  nodecontentPage,
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
