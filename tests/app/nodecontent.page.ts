import { NodeContent } from '../../mod.ts';
import { addContent, addLog, createActions } from './page.ts';

export default function (): void {
  let nodeContent: NodeContent<Element>;

  const element = document.createElement('div');
  addContent(element);

  const context = {
    eventHandler: (event: Event) => {
      addLog(`eventHandler: ${event.type}`);
    },
  };

  createActions({
    'init': () => {
      nodeContent = new NodeContent(element, context);
      addLog(element.outerHTML);
    },
    'prop-container': () => {
      addLog(nodeContent.container.outerHTML);
      addLog(element.outerHTML);
    },
    'method-update-string': () => {
      nodeContent.update('<p>string</p>');
      addLog(element.outerHTML);
    },
    'method-update-documentfragment': () => {
      const template = document.createElement('template');
      template.innerHTML = '<p>DocumentFragment</p>';
      nodeContent.update(template.content);
      addLog(element.outerHTML);
    },
    'method-update-node': () => {
      const template = document.createElement('template');
      template.innerHTML = '<p>Node</p>';
      nodeContent.update(template.content.querySelector('p') as Element);
      addLog(element.outerHTML);
    },
    'method-update-nodelist': () => {
      const template = document.createElement('template');
      template.innerHTML = '<p>NodeList</p><p>NodeList</p>';
      nodeContent.update(template.content.querySelectorAll('p'));
      addLog(element.outerHTML);
    },
    'method-clone': () => {
      const template = document.createElement('template');
      template.content.appendChild(nodeContent.clone());
      addLog(template.innerHTML);
      addLog(element.outerHTML);
    },
    'dom-element': () => {
      nodeContent.update('<ul><li title="1">1</li></ul>');
      const li1a = nodeContent.container.querySelector('li[title="1"]') as Element;
      addLog(element.outerHTML);

      nodeContent.update('<ul><li title="1">1</li><li title="2">2</li></ul>');
      const li1b = nodeContent.container.querySelector('li[title="1"]') as Element;
      const li2a = nodeContent.container.querySelector('li[title="2"]') as Element;
      addLog(element.outerHTML);
      addLog(`li[title="1"] is same object reference: ${li1a === li1b}`);

      nodeContent.update('<ul><li title="0">0</li><li title="1">1</li><li title="2">2</li></ul>');
      const li0a = nodeContent.container.querySelector('li[title="0"]') as Element;
      const li1c = nodeContent.container.querySelector('li[title="1"]') as Element;
      const li2b = nodeContent.container.querySelector('li[title="2"]') as Element;
      addLog(element.outerHTML);
      addLog(`li[title="1"] is same object reference: ${li1b === li1c}`);
      addLog(`li[title="2"] is same object reference: ${li2a === li2b}`);

      nodeContent.update('<ol><li title="0">0</li><li title="1">1</li><li title="2">2</li></ol>');
      const li0b = nodeContent.container.querySelector('li[title="0"]') as Element;
      const li1d = nodeContent.container.querySelector('li[title="1"]') as Element;
      const li2c = nodeContent.container.querySelector('li[title="2"]') as Element;
      addLog(element.outerHTML);
      addLog(`li[title="0"] is same object reference: ${li0a === li0b}`);
      addLog(`li[title="1"] is same object reference: ${li1c === li1d}`);
      addLog(`li[title="2"] is same object reference: ${li2b === li2c}`);
    },
    'dom-elementattribute': () => {
      nodeContent.update('<p>has no attributes</p>');
      const pa = nodeContent.container.querySelector('p') as Element;
      addLog(element.outerHTML);

      nodeContent.update('<p attr1="attr1" data-attr2="attr2">has attributes</p>');
      const pb = nodeContent.container.querySelector('p') as Element;
      addLog(element.outerHTML);
      addLog(`p is same object reference: ${pa === pb}`);

      nodeContent.update('<p>has no attributes</p>');
      const pc = nodeContent.container.querySelector('p') as Element;
      addLog(element.outerHTML);
      addLog(`p is same object reference: ${pb === pc}`);
    },
    'dom-elementevent': () => {
      nodeContent.update('<p onclick="this.eventHandler(event)">has click event</p>');
      nodeContent.container.querySelector('p')?.click();
      addLog(element.outerHTML);
    },
  });
}
