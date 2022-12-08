import type { NodeContentData } from './types.ts';

import Component from './Component.ts';

export default function createComponent(name: string, options?: {
  observedAttributes?: Array<string>;
  observedObjects?: Array<unknown>;
  init?: { (context: Component): void };
  template?: { (context: Component): NodeContentData };
}): typeof CustomComponent {
  const CustomComponent = class extends Component {
    static override get observedAttributes(): Array<string> {
      return options?.observedAttributes ?? super.observedAttributes;
    }

    constructor() {
      super();

      if (options?.init && typeof options.init === 'function') {
        options.init(this);
      }
    }

    override connectedCallback(): void {
      super.connectedCallback();

      if (options?.observedObjects) {
        this.observe(...options.observedObjects);
      }
    }

    override disconnectedCallback(): void {
      if (options?.observedObjects) {
        this.unobserve(...options.observedObjects);
      }

      super.disconnectedCallback();
    }

    override template(): NodeContentData {
      return (options?.template && typeof options.template === 'function') ? options.template(this) : super.template();
    }
  };

  CustomComponent.define(name);

  return CustomComponent;
}
