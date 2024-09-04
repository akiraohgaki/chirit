# Chirit

A library for building front-end applications.

It provides a library for Web components, state management, client-side routing, Web storage, and more.

## CDN

TypeScript

```ts
import * as chirit from 'https://cdn.jsdelivr.net/gh/akiraohgaki/chirit@1.5/mod.ts';
```

JavaScript

```js
import * as chirit from 'https://cdn.jsdelivr.net/gh/akiraohgaki/chirit@1.5/mod.bundle.js';
```

## Install

Use with Deno

```sh
deno add @akiraohgaki/chirit
```

Use with npm

```sh
npx jsr add @akiraohgaki/jsr-test
```

See https://jsr.io/@akiraohgaki/chirit for install with other package managers.

## Example

TypeScript

```ts
import { Component, State } from '@akiraohgaki/chirit';

// `State` is an observable state for atomic state management.
const epochTimeState = new State(Date.now());

setInterval(() => {
  epochTimeState.set(Date.now());
}, 100);

// `Component` is a base class for building custom web components.
class EpochTimeComponent extends Component {
  override connectedCallback(): void {
    super.connectedCallback();
    this.observe(epochTimeState);
  }

  override disconnectedCallback(): void {
    this.unobserve(epochTimeState);
    super.disconnectedCallback();
  }

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
