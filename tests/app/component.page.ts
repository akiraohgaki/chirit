import type { ComponentContentContainer, NodeContentData } from '../../mod.ts';

import { Component, ElementAttributesProxy, NodeContent, Observable } from '../../mod.ts';
import { addContent, addLog, createActions } from './page.ts';

export default function (): void {
  let testComponent: TestComponent;

  const observable1 = new Observable();
  const observable2 = new Observable();

  let isTemplateError = false;
  let isRenderError = false;
  let isUpdatedCallbackError = false;

  class TestComponent extends Component {
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
    override createContentContainer(): ComponentContentContainer {
      addLog('createContentContainer');
      return super.createContentContainer();
    }
    override template(): NodeContentData {
      addLog('template');
      if (isTemplateError) {
        throw new Error('error');
      }
      return super.template();
    }
  }

  createActions({
    'method-define': () => {
      TestComponent.define('test-component');
      addLog(`defined: ${customElements.get('test-component') !== undefined}`);
    },
    'init-constructor': () => {
      testComponent = new TestComponent();
      addLog(testComponent.outerHTML);
    },
    'init-createelement': () => {
      testComponent = document.createElement('test-component') as TestComponent;
      addLog(testComponent.outerHTML);
    },
    'init-html': () => {
      const template = document.createElement('template');
      template.innerHTML = '<test-component attr1="attr1">test-component</test-component>';
      testComponent = template.content.querySelector('test-component') as TestComponent;
      addContent(testComponent);
      addLog(testComponent.outerHTML);
    },
    'prop-updatecounter': () => {
      addLog(`${testComponent.updateCounter}`);
      addLog(testComponent.outerHTML);
    },
    'prop-attr': () => {
      addLog(`object instance of ElementAttributesProxy: ${testComponent.attr instanceof ElementAttributesProxy}`);
      addLog(`object instance of Object: ${testComponent.attr instanceof Object}`);
      addLog(`attr.attr1: ${testComponent.attr.attr1}`);
      addLog(testComponent.outerHTML);
    },
    'prop-content': () => {
      addLog(`object instance of NodeContent: ${testComponent.content instanceof NodeContent}`);
      addLog(testComponent.outerHTML);
    },
    'method-update': async () => {
      await testComponent.update();
      addLog(testComponent.outerHTML);
    },
    'method-updatesync': () => {
      testComponent.updateSync();
      addLog(testComponent.outerHTML);
    },
    'method-render': () => {
      testComponent.render();
      addLog(testComponent.outerHTML);
    },
    'method-observe': () => {
      testComponent.observe(observable1, observable2);
    },
    'method-unobserve': () => {
      testComponent.unobserve(observable1, observable2);
    },
    'method-dispatch': () => {
      const eventHandler = (event: Event) => {
        addLog(`eventHandler: ${event.type} ${JSON.stringify((event as CustomEvent).detail)}`);
      };
      testComponent.addEventListener('custom-event', eventHandler);
      testComponent.dispatch('custom-event', { prop: 0 });
      testComponent.removeEventListener('custom-event', eventHandler);
    },
    'method-createcontentcontainer': () => {
      // Shadow root cannot be created on a host which already hosts a shadow tree,
      // so just check if content.container is ShadowRoot
      addLog(`object instance of ShadowRoot: ${testComponent.content.container instanceof ShadowRoot}`);
      addLog(testComponent.outerHTML);
    },
    'method-template': () => {
      addLog(`blank string: ${testComponent.template() === ''}`);
      addLog(testComponent.outerHTML);
    },
    'callback-attributechangedcallback': () => {
      testComponent.attr.attr1 = 'attr1';
      addLog(testComponent.outerHTML);

      testComponent.attr.attr1 = 'text';
      addLog(testComponent.outerHTML);

      testComponent.attr.attr1 = 'attr1';
      addLog(testComponent.outerHTML);
    },
    'callback-connectedcallback': () => {
      const documentFragment = document.createDocumentFragment();
      documentFragment.appendChild(testComponent);
      addContent(testComponent);
      addLog(testComponent.outerHTML);
    },
    'callback-disconnectedcallback': () => {
      const documentFragment = document.createDocumentFragment();
      documentFragment.appendChild(testComponent);
      addContent(testComponent);
      addLog(testComponent.outerHTML);
    },
    'callback-adoptedcallback': () => {
      const iframe = document.createElement('iframe');
      iframe.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';
      addContent(iframe);
      iframe.contentWindow?.document.body.appendChild(testComponent);
      addContent(testComponent);
      addLog(testComponent.outerHTML);
    },
    'callback-updatedcallback': () => {
      testComponent.updateSync();
      addLog(testComponent.outerHTML);
    },
    'callback-errorcallback': () => {
      isTemplateError = true;
      testComponent.updateSync();
      isTemplateError = false;
      addLog(testComponent.outerHTML);

      isRenderError = true;
      testComponent.updateSync();
      isRenderError = false;
      addLog(testComponent.outerHTML);

      isUpdatedCallbackError = true;
      testComponent.updateSync();
      isUpdatedCallbackError = false;
      addLog(testComponent.outerHTML);
    },
    'observable-notify': () => {
      observable1.notify(true);
      observable2.notify(true);
    },
  });
}
