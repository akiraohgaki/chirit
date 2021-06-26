import { CustomElement } from '../chirit.js';

class TestElement extends CustomElement {

  constructor() {
    console.log('constructor');
    super();
    console.log(this.updatedCount);
    this.handleClick = this.handleClick.bind(this);
  }

  static get observedAttributes(): Array<string> {
    console.log('observedAttributes');
    return ['datetime', 'plus'];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    console.log('attributeChangedCallback');
    console.log(name, oldValue, newValue);
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  connectedCallback(): void {
    console.log('connectedCallback');
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback(): void {
    console.log('disconnectedCallback');
    this.removeEventListener('click', this.handleClick);
  }

  adoptedCallback(oldDocument: Document, newDocment: Document): void {
    console.log('adoptedCallback');
    console.log(oldDocument, newDocment);
  }

  protected render(): void {
    console.log('render');
    this.innerHTML = `
      <span>${this.getAttribute('datetime')}</span>
      <button data-update>Update</button>
    `;
  }

  protected updatedCallback(): void {
    console.log('updatedCallback');
    console.log(this.updatedCount);
    if (this.updatedCount === 4) {
      throw new Error('dummy');
    }
  }

  protected errorCallback(exception: any): void {
    console.log('errorCallback');
    super.errorCallback(exception);
  }

  protected handleClick(event: Event): void {
    console.log(event);
    event.preventDefault();
    const target = event.target as Element;
    if (target.hasAttribute('data-update')) {
      this.setAttribute('datetime', `${new Date}`);
      this.setAttribute('plus', this.getAttribute('plus') + '+');
    }
  }

}

TestElement.define('test-element');

export default function (): void {
  const main = document.getElementById('main') as Element;
  main.innerHTML = `
    <div id="customelement-wrapper">
    <iframe id="customelement-iframe" style="display: none;"></iframe>
    <test-element datetime="${new Date}"></test-element>
    </div>
  `;

  const wrapper = document.getElementById('customelement-wrapper') as Element;
  const iframe = document.getElementById('customelement-iframe') as HTMLIFrameElement;
  const testElement = wrapper.querySelector('test-element') as CustomElement;

  iframe.contentDocument?.body.appendChild(testElement);
  wrapper.appendChild(testElement);

  testElement.setAttribute('plus', '+');

  testElement.update().then(() => {
    console.log('update promise 1');
  });
  testElement.update().then(() => {
    console.log('update promise 2');
  });
  testElement.update().then(() => {
    console.log('update promise 3');
  });

  testElement.updateSync();

  console.log(testElement.updatedCount);
}
