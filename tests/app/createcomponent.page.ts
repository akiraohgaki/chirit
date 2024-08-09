import { Component, createComponent } from '../../mod.ts';
import { addContent, addLog, createActions } from './page.ts';

interface TestComponentType extends Component {
  eventHandler: { (event: Event): void };
}

export default function (): void {
  let TestComponent: TestComponentType;
  let testComponent: TestComponentType;

  createActions({
    'function-createcomponent': () => {
      TestComponent = createComponent<TestComponentType>('test-component', {
        observedAttributes: ['attr1'],
        init: (context) => {
          addLog('init');
          context.eventHandler = (event) => {
            addLog(`eventHandler: ${event.type} ${JSON.stringify((event as CustomEvent).detail)}`);
          };
        },
        connected: (context) => {
          addLog('connected');
          context.addEventListener('custom-event', context.eventHandler);
        },
        disconnected: (context) => {
          addLog('disconnected');
          context.removeEventListener('custom-event', context.eventHandler);
        },
        template: (context) => {
          addLog('template');
          return `<p onclick="this.dispatch('custom-event', { prop: 0 })">attr1=${context.attr.attr1}</p>`;
        },
      });
      addLog(`defined: ${customElements.get('test-component') !== undefined}`);
    },
    'init-html': () => {
      const template = document.createElement('template');
      template.innerHTML = '<test-component attr1="attr1">test-component</test-component>';
      testComponent = template.content.querySelector('test-component') as TestComponentType;
      addContent(testComponent);
      addLog(testComponent.outerHTML);
      addLog(testComponent.shadowRoot?.innerHTML ?? '');
    },
    'callback-attributechangedcallback': () => {
      testComponent.attr.attr1 = 'attr1';
      addLog(testComponent.outerHTML);
      addLog(testComponent.shadowRoot?.innerHTML ?? '');

      testComponent.attr.attr1 = 'text';
      addLog(testComponent.outerHTML);
      addLog(testComponent.shadowRoot?.innerHTML ?? '');
    },
    'callback-connectedcallback': () => {
      const documentFragment = document.createDocumentFragment();
      documentFragment.appendChild(testComponent);
      addContent(testComponent);
      addLog(testComponent.outerHTML);
      addLog(testComponent.shadowRoot?.innerHTML ?? '');
    },
    'callback-disconnectedcallback': () => {
      const documentFragment = document.createDocumentFragment();
      documentFragment.appendChild(testComponent);
      addContent(testComponent);
      addLog(testComponent.outerHTML);
      addLog(testComponent.shadowRoot?.innerHTML ?? '');
    },
    'dom-elementevent': () => {
      testComponent.content.querySelector('p')?.click();
      addLog(testComponent.outerHTML);
      addLog(testComponent.shadowRoot?.innerHTML ?? '');
    },
    'object-instance': () => {
      addLog(`class instance of Component: ${TestComponent instanceof Component}`);
      addLog(`class instance of Function: ${TestComponent instanceof Function}`);
      addLog(`object instance of Component: ${testComponent instanceof Component}`);
      addLog(`object instance of Function: ${testComponent instanceof Function}`);
    },
  });
}
