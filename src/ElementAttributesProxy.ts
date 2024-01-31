export default class ElementAttributesProxy {
  [key: string]: string;

  constructor(target: Element) {
    // Avoid circular references to make GC easier
    let targetRef: WeakRef<Element> | null = new WeakRef(target);

    const getTarget = () => {
      if (targetRef) {
        const target = targetRef.deref();
        if (target) {
          return target;
        } else {
          targetRef = null;
        }
      }
      throw new Error('The element not available.');
    };

    // Class instance as Proxy of Object, not this class instance
    return new Proxy({}, {
      set: (_target, name, value) => {
        const target = getTarget();
        if (typeof name === 'string' && typeof value === 'string') {
          target.setAttribute(name, value);
          return true;
        }
        return false;
      },
      get: (_target, name) => {
        const target = getTarget();
        // Return undefined instead of null if attribute is not exist
        if (typeof name === 'string' && target.hasAttribute(name)) {
          return target.getAttribute(name);
        }
        return undefined;
      },
      deleteProperty: (_target, name) => {
        const target = getTarget();
        if (typeof name === 'string' && target.hasAttribute(name)) {
          target.removeAttribute(name);
          return true;
        }
        return false;
      },
      has: (_target, name) => {
        const target = getTarget();
        if (typeof name === 'string' && target.hasAttribute(name)) {
          return true;
        }
        return false;
      },
      ownKeys: () => {
        const target = getTarget();
        const keys = [];
        if (target.hasAttributes()) {
          for (const attribute of Array.from(target.attributes)) {
            keys.push(attribute.name);
          }
        }
        return keys;
      },
      getOwnPropertyDescriptor: (_target, name) => {
        const target = getTarget();
        if (typeof name === 'string' && target.hasAttribute(name)) {
          return {
            configurable: true,
            enumerable: true,
            value: target.getAttribute(name),
          };
        }
        return undefined;
      },
    });
  }
}
