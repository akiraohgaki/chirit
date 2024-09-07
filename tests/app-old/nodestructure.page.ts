import { NodeStructure } from '../../mod.ts';
import { addContent, addLog, createActions } from './page.ts';

export default function (): void {
  let nodeStructure: NodeStructure<Element>;

  const element = document.createElement('div');
  addContent(element);

  const context = {
    eventHandler: (event: Event) => {
      addLog(`eventHandler: ${event.type}`);
    },
  };

  createActions({
    'init': () => {
      nodeStructure = new NodeStructure(element, context);
      addLog(element.outerHTML);
    },
    'prop-host': () => {
      addLog(nodeStructure.host.outerHTML);
      addLog(element.outerHTML);
    },
    'method-update-string': () => {
      nodeStructure.update('<p>string</p>');
      addLog(element.outerHTML);
    },
    'method-update-documentfragment': () => {
      const template = document.createElement('template');
      template.innerHTML = '<p>DocumentFragment</p>';
      nodeStructure.update(template.content);
      addLog(element.outerHTML);
    },
    'method-update-node': () => {
      const template = document.createElement('template');
      template.innerHTML = '<p>Node</p>';
      nodeStructure.update(template.content.querySelector('p') as Element);
      addLog(element.outerHTML);
    },
    'method-update-nodelist': () => {
      const template = document.createElement('template');
      template.innerHTML = '<p>NodeList</p><p>NodeList</p>';
      nodeStructure.update(template.content.querySelectorAll('p'));
      addLog(element.outerHTML);
    },
    'method-clone': () => {
      const template = document.createElement('template');
      template.content.appendChild(nodeStructure.clone());
      addLog(template.innerHTML);
      addLog(element.outerHTML);
    },
    'dom-element': () => {
      nodeStructure.update('<ul><li title="1">1</li></ul>');
      const li1a = nodeStructure.host.querySelector('li[title="1"]') as Element;
      addLog(element.outerHTML);

      nodeStructure.update('<ul><li title="1">1</li><li title="2">2</li></ul>');
      const li1b = nodeStructure.host.querySelector('li[title="1"]') as Element;
      const li2a = nodeStructure.host.querySelector('li[title="2"]') as Element;
      addLog(element.outerHTML);
      addLog(`li[title="1"] is same object reference: ${li1a === li1b}`);

      nodeStructure.update('<ul><li title="0">0</li><li title="1">1</li><li title="2">2</li></ul>');
      const li0a = nodeStructure.host.querySelector('li[title="0"]') as Element;
      const li1c = nodeStructure.host.querySelector('li[title="1"]') as Element;
      const li2b = nodeStructure.host.querySelector('li[title="2"]') as Element;
      addLog(element.outerHTML);
      addLog(`li[title="1"] is same object reference: ${li1b === li1c}`);
      addLog(`li[title="2"] is same object reference: ${li2a === li2b}`);

      nodeStructure.update('<ol><li title="0">0</li><li title="1">1</li><li title="2">2</li></ol>');
      const li0b = nodeStructure.host.querySelector('li[title="0"]') as Element;
      const li1d = nodeStructure.host.querySelector('li[title="1"]') as Element;
      const li2c = nodeStructure.host.querySelector('li[title="2"]') as Element;
      addLog(element.outerHTML);
      addLog(`li[title="0"] is same object reference: ${li0a === li0b}`);
      addLog(`li[title="1"] is same object reference: ${li1c === li1d}`);
      addLog(`li[title="2"] is same object reference: ${li2b === li2c}`);
    },
    'dom-elementattribute': () => {
      nodeStructure.update('<p>has no attributes</p>');
      const pa = nodeStructure.host.querySelector('p') as Element;
      addLog(element.outerHTML);

      nodeStructure.update('<p attr1="attr1" data-attr2="attr2">has attributes</p>');
      const pb = nodeStructure.host.querySelector('p') as Element;
      addLog(element.outerHTML);
      addLog(`p is same object reference: ${pa === pb}`);

      nodeStructure.update('<p>has no attributes</p>');
      const pc = nodeStructure.host.querySelector('p') as Element;
      addLog(element.outerHTML);
      addLog(`p is same object reference: ${pb === pc}`);
    },
    'dom-elementevent': () => {
      nodeStructure.update('<p onclick="this.eventHandler(event)">has click event</p>');
      nodeStructure.host.querySelector('p')?.click();
      addLog(element.outerHTML);
    },
  });
}
