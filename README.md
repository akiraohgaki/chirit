# Chirit

[![JSR](https://jsr.io/badges/@akiraohgaki/chirit)](https://jsr.io/@akiraohgaki/chirit)

A library for building front-end applications.

It provides a library for Web components, state management, client-side routing, Web storage, and more.

## Usage

### Import from CDN

TypeScript

```ts
import * as chirit from 'https://cdn.jsdelivr.net/gh/akiraohgaki/chirit@version/mod.ts';
```

JavaScript

```js
import * as chirit from 'https://cdn.jsdelivr.net/gh/akiraohgaki/chirit@version/mod.bundle.js';
```

> [!NOTE]
> Replace the @version in the URL to a specific version.

### Import from package

Add package

```sh
# Deno
deno add @akiraohgaki/chirit

# Node.js
npx jsr add @akiraohgaki/chirit
```

> [!TIP]
> See https://jsr.io/@akiraohgaki/chirit for install with other package managers.

Import module

```ts
import * as chirit from '@akiraohgaki/chirit';
```

### Examples

This is a component that shows current epoch time.

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
  styles: () => {
    return [
      ...document.adoptedStyleSheets,
      `
        :host { display: inline-block; }
        span { font-size: 140%; }
      `,
    ];
  },
  template: (context) => {
    return `
      <style>span { color: ${context.attr.color}; }</style>
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
