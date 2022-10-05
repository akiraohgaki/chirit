import { JSDOM } from 'https://jspm.dev/jsdom';

const generateDom = () => {
  return new JSDOM(
    `<!DOCTYPE html><html><head></head><body></body></html>`,
    {
      url: 'https://example.com/',
      referrer: 'https://example.org/',
      contentType: 'text/html',
    },
  );
};

export { generateDom };
