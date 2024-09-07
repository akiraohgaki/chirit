import { CustomElement } from '../../mod.ts';
import { addContent, addLog, createActions } from './page.ts';

export default function (): void {
  let testElement: TestElement;

  let isRenderError = false;
  let isUpdatedCallbackError = false;

  class TestElement extends CustomElement {
    static override get observedAttributes(): Array<string> {
      addLog('observedAttributes');
      return ['attr1', ...super.observedAttributes];
    }
    constructor() {
      addLog('constructor');
      super();
    }
    override attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null,
      namespace?: string | null,
    ): void {
      addLog('attributeChangedCallback');
      super.attributeChangedCallback(name, oldValue, newValue, namespace);
    }
    override connectedCallback(): void {
      addLog('connectedCallback');
      super.connectedCallback();
    }
    override disconnectedCallback(): void {
      addLog('disconnectedCallback');
      super.disconnectedCallback();
    }
    override adoptedCallback(oldDocument: Document, newDocument: Document): void {
      addLog('adoptedCallback');
      super.adoptedCallback(oldDocument, newDocument);
    }
    override update(): Promise<void> {
      addLog('update');
      return super.update();
    }
    override updateSync(): void {
      addLog('updateSync');
      super.updateSync();
    }
    override render(): void {
      addLog('render');
      if (isRenderError) {
        throw new Error('error');
      }
      super.render();
    }
    override updatedCallback(): void {
      addLog('updatedCallback');
      if (isUpdatedCallbackError) {
        throw new Error('error');
      }
      super.updatedCallback();
    }
    override errorCallback(exception: unknown): void {
      addLog('errorCallback');
      addLog(`exception: ${(exception as Error).message}`);
      super.errorCallback(exception);
    }
  }

  createActions({
    'method-define': () => {
      TestElement.define('test-element');
      addLog(`defined: ${customElements.get('test-element') !== undefined}`);
    },
    'init-constructor': () => {
      testElement = new TestElement();
      addLog(testElement.outerHTML);
    },
    'init-createelement': () => {
      testElement = document.createElement('test-element') as TestElement;
      addLog(testElement.outerHTML);
    },
    'init-html': () => {
      const template = document.createElement('template');
      template.innerHTML = '<test-element attr1="attr1">test-element</test-element>';
      testElement = template.content.querySelector('test-element') as TestElement;
      addContent(testElement);
      addLog(testElement.outerHTML);
    },
    'prop-updatecounter': () => {
      addLog(`${testElement.updateCounter}`);
      addLog(testElement.outerHTML);
    },
    'method-update': async () => {
      await testElement.update();
      addLog(testElement.outerHTML);
    },
    'method-updatesync': () => {
      testElement.updateSync();
      addLog(testElement.outerHTML);
    },
    'method-render': () => {
      testElement.render();
      addLog(testElement.outerHTML);
    },
    'callback-attributechangedcallback': () => {
      testElement.setAttribute('attr1', 'attr1');
      addLog(testElement.outerHTML);

      testElement.setAttribute('attr1', 'text');
      addLog(testElement.outerHTML);

      testElement.setAttribute('attr1', 'attr1');
      addLog(testElement.outerHTML);
    },
    'callback-connectedcallback': () => {
      const documentFragment = document.createDocumentFragment();
      documentFragment.appendChild(testElement);
      addContent(testElement);
      addLog(testElement.outerHTML);
    },
    'callback-disconnectedcallback': () => {
      const documentFragment = document.createDocumentFragment();
      documentFragment.appendChild(testElement);
      addContent(testElement);
      addLog(testElement.outerHTML);
    },
    'callback-adoptedcallback': () => {
      const iframe = document.createElement('iframe');
      iframe.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';
      addContent(iframe);
      iframe.contentWindow?.document.body.appendChild(testElement);
      addContent(testElement);
      addLog(testElement.outerHTML);
    },
    'callback-updatedcallback': () => {
      testElement.updateSync();
      addLog(testElement.outerHTML);
    },
    'callback-errorcallback': () => {
      isRenderError = true;
      testElement.updateSync();
      isRenderError = false;
      addLog(testElement.outerHTML);

      isUpdatedCallbackError = true;
      testElement.updateSync();
      isUpdatedCallbackError = false;
      addLog(testElement.outerHTML);
    },
  });
}
