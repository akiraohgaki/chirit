# Chirit

[![JSR](https://jsr.io/badges/@akiraohgaki/chirit)](https://jsr.io/@akiraohgaki/chirit)

A library for building front-end applications.

Chirit provides functionality required for front-end application development,
such as creating Web components, state management, client-side routing, and manipulating Web storage.

## Usage

### Import module from CDN

TypeScript

```ts
import * as chirit from 'https://cdn.jsdelivr.net/gh/akiraohgaki/chirit@version/mod.ts';
```

JavaScript

```js
import * as chirit from 'https://cdn.jsdelivr.net/gh/akiraohgaki/chirit@version/mod.bundle.js';
```

> [!NOTE]
> Replace @version with the desired version.

### Import module from package

Add package with Deno

```sh
deno add jsr:@akiraohgaki/chirit
```

Add package with npm

```sh
npx jsr add @akiraohgaki/chirit
```

> [!TIP]
> See https://jsr.io/@akiraohgaki/chirit for install with other package managers.

Import module

```ts
import * as chirit from '@akiraohgaki/chirit';
```

### Examples

Create a counter component using the createComponent function.

```ts
import { type Component, createComponent, css, html } from '@akiraohgaki/chirit';

interface CounterComponentInterface extends Component<{ props: { count: number } }> {
  increment: () => void;
  decrement: () => void;
}

createComponent<CounterComponentInterface>('counter-component', {
  properties: {
    count: { value: 0 },
  },
  init: (context) => {
    context.increment = () => {
      context.props.count = context.props.count + 1;
    };
    context.decrement = () => {
      context.props.count = context.props.count - 1;
    };
  },
  styles: () => {
    return css`
      :host {
        display: inline-block;
      }
      span {
        color: red;
      }
    `;
  },
  template: (context) => {
    return html`
      <span>${context.props.count}</span>
      <button onclick="this.increment()">+</button>
      <button onclick="this.decrement()">-</button>
    `;
  },
});
```

```html
<counter-component count="0"></counter-component>
```

Also, make the counter state to be shared with other components using the State class.

```ts
import { type Component, createComponent, css, html, State } from '@akiraohgaki/chirit';

interface CounterComponentInterface extends Component {
  increment: () => void;
  decrement: () => void;
}

export const counterState = new State(0);

createComponent<CounterComponentInterface>('counter-component', {
  init: (context) => {
    context.observe(counterState);

    context.increment = () => {
      counterState.set(counterState.get() + 1);
    };
    context.decrement = () => {
      counterState.set(counterState.get() - 1);
    };
  },
  styles: () => {
    return css`
      :host {
        display: inline-block;
      }
      span {
        color: red;
      }
    `;
  },
  template: () => {
    return html`
      <span>${counterState.get()}</span>
      <button onclick="this.increment()">+</button>
      <button onclick="this.decrement()">-</button>
    `;
  },
});
```

```html
<counter-component></counter-component>
```

## Features

### Web components

[Component](https://jsr.io/@akiraohgaki/chirit/doc/~/Component) class:

- Lifecycle callbacks: updatedCallback, errorCallback, etc.
- Reactive to changes: Automatically re-renders when properties, attributes or states changed.
- Template and style management: Define the structure and style of your component.
- Event binding: Bind event handlers to elements within the component.
- DOM diffing: Efficiently updates the DOM node tree when content changed.
- Custom event dispatching: Publish events to communicate with other components.

[createComponent](https://jsr.io/@akiraohgaki/chirit/doc/~/createComponent) function:

- A convenient function for quickly creating components based on the Component class.

[html](https://jsr.io/@akiraohgaki/chirit/doc/~/html) function:

- A tagged template function for HTML.
- Some code editors make syntax highlighting, formatting, and suggestions for template literals.

[css](https://jsr.io/@akiraohgaki/chirit/doc/~/css) function:

- A tagged template function for CSS.
- Some code editors make syntax highlighting, formatting, and suggestions for template literals.

### State management

[Store](https://jsr.io/@akiraohgaki/chirit/doc/~/Store) class:

- An observable store for managing complex state.

[State](https://jsr.io/@akiraohgaki/chirit/doc/~/State) class:

- An observable state for managing atomic state.

### Client-side routing

[Router](https://jsr.io/@akiraohgaki/chirit/doc/~/Router) class:

- Supports both hash-based and history-based routing.

### Web storage

[WebStorage](https://jsr.io/@akiraohgaki/chirit/doc/~/WebStorage) class:

- Supports both local storage and session storage modes.
- Stores and retrieves values as JSON serializable objects.

## Documentation

https://jsr.io/@akiraohgaki/chirit/doc

## License

Copyright: 2018, Akira Ohgaki

License: BSD-2-Clause
