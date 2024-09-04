# Chirit

A library for building front-end applications.

It provides a library for Web components, state management, client-side routing, Web storage, and more.

## CDN

TypeScript

```ts
import * as chirit from 'https://cdn.jsdelivr.net/gh/akiraohgaki/chirit@1.6/mod.ts';
```

JavaScript

```js
import * as chirit from 'https://cdn.jsdelivr.net/gh/akiraohgaki/chirit@1.6/mod.bundle.js';
```

## Install

Use with Deno

```sh
deno add @akiraohgaki/chirit
```

Use with npm

```sh
npx jsr add @akiraohgaki/chirit
```

See https://jsr.io/@akiraohgaki/chirit for install with other package managers.

## Example

TypeScript

```ts
import { Component, State } from '@akiraohgaki/chirit';

// The State class is an observable state for atomic state management.
const epochTimeState = new State(Date.now());

setInterval(() => {
  epochTimeState.set(Date.now());
}, 100);

// The Component class is a base class for building custom web components.
class EpochTimeComponent extends Component {
  static override get observedAttributes(): Array<string> {
    return ['milliseconds'];
  }

  override connectedCallback(): void {
    super.connectedCallback(); // must always be called first
    this.observe(epochTimeState); // observe the observables
  }

  override disconnectedCallback(): void {
    this.unobserve(epochTimeState); // unobserve the observables
    super.disconnectedCallback(); // should always be called last
  }

  // When a observed attributes or states changes, the template content is re-rendered.
  override template(): string {
    return `
      <style>
      :host {
        display: inline-block;
      }
      span {
        font-size: 120%;
      }
      </style>

      <span onclick="this.clickHandler(event)">
      ${this.attr.milliseconds ? epochTimeState.get() : epochTimeState.get() * 1000}
      </span>
    `;
  }

  clickHandler(event: Event): void {
    console.log(event, epochTimeState.get());
  }
}

// Define the custom element.
EpochTimeComponent.define('epoch-time');
```

HTML

```html
<epoch-time milliseconds="true"></epoch-time>
```

## Documents

https://jsr.io/@akiraohgaki/chirit/doc

## License

Copyright: 2018, Akira Ohgaki

License: BSD-2-Clause
