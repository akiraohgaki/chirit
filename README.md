# Chirit

[![JSR](https://jsr.io/badges/@akiraohgaki/chirit)](https://jsr.io/@akiraohgaki/chirit)

A library for building front-end applications.

It provides a library for Web components, state management, client-side routing, Web storage, and more.

## Usage

### CDN

TypeScript

```ts
import * as chirit from 'https://cdn.jsdelivr.net/gh/akiraohgaki/chirit@1.6/mod.ts';
```

JavaScript

```js
import * as chirit from 'https://cdn.jsdelivr.net/gh/akiraohgaki/chirit@1.6/mod.bundle.js';
```

### Install

Use with Deno

```sh
deno add @akiraohgaki/chirit
```

Use with npm

```sh
npx jsr add @akiraohgaki/chirit
```

See https://jsr.io/@akiraohgaki/chirit for install with other package managers.

### Examples

A component that shows current epoch time.

TypeScript/JavaScript

```ts
import { createComponent, State } from '@akiraohgaki/chirit';

const epochTimeState = new State(Date.now());
setInterval(() => {
  epochTimeState.set(Date.now());
}, 100);

createComponent('epoch-time', {
  observedAttributes: ['color'],
  init: (context) => {
    context.observe(epochTimeState);
  },
  template: (context) => {
    return `
      <style>
        :host { display: inline-block; }
        span { font-color: ${context.attr.color}; }
      </style>
      <span>${epochTimeState.get()}</span>
    `;
  },
});
```

HTML

```html
<epoch-time color="green"></epoch-time>
```

## Features

### Web components

- [createComponent](https://jsr.io/@akiraohgaki/chirit/doc/~/createComponent)
- [Component](https://jsr.io/@akiraohgaki/chirit/doc/~/Component)

### State management

- [Store](https://jsr.io/@akiraohgaki/chirit/doc/~/Store)
- [State](https://jsr.io/@akiraohgaki/chirit/doc/~/State)

### Client-side routing

- [Router](https://jsr.io/@akiraohgaki/chirit/doc/~/Router)

### Web storage

- [WebStorage](https://jsr.io/@akiraohgaki/chirit/doc/~/WebStorage)

## Documentation

https://jsr.io/@akiraohgaki/chirit/doc

## License

Copyright: 2018, Akira Ohgaki

License: BSD-2-Clause
