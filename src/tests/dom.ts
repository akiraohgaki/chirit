import { JSDOM } from 'jsdom';
import dom from '../dom.ts';

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
