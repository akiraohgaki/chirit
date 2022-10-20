import { JSDOM } from 'https://jspm.dev/jsdom';
import dom from '../src/dom.ts';

const jsdom = new JSDOM(
  '<!DOCTYPE html><html><head></head><body></body></html>',
  {
    url: 'https://example.com/',
    referrer: 'https://example.org/',
    contentType: 'text/html',
    storageQuota: 10240,
  },
);

dom.globalThis = jsdom.window;

export default dom;
