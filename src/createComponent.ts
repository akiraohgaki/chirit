import type { CreateComponentOptions, NodeContentData } from './types.ts';

import Component from './Component.ts';

export default function createComponent<T = Component>(name: string, options?: CreateComponentOptions<T>): T {
  const CustomComponent = class extends Component {
    static override get observedAttributes(): Array<string> {
      return (options?.observedAttributes && Array.isArray(options.observedAttributes))
        ? options.observedAttributes
        : super.observedAttributes;
    }

    constructor() {
      super();

      if (options?.init && typeof options.init === 'function') {
        options.init(this as unknown as T);
      }
    }

    override connectedCallback(): void {
      super.connectedCallback();

      if (options?.connected && typeof options.connected === 'function') {
        options.connected(this as unknown as T);
      }
    }

    override disconnectedCallback(): void {
      if (options?.disconnected && typeof options.disconnected === 'function') {
        options.disconnected(this as unknown as T);
      }

      super.disconnectedCallback();
    }

    override template(): NodeContentData {
      return (options?.template && typeof options.template === 'function')
        ? options.template(this as unknown as T)
        : super.template();
    }
  };

  CustomComponent.define(name);

  return CustomComponent as T;
}
