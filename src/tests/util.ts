import { JSDOM } from 'https://jspm.dev/jsdom';
import util from '../util.ts';

const jsdom = new JSDOM(
  '<!DOCTYPE html><html><head></head><body></body></html>',
  {
    url: 'https://example.com/',
    referrer: 'https://example.org/',
    contentType: 'text/html',
    storageQuota: 1024 * 10,
  },
);

util.globalThis = jsdom.window;

export default util;
