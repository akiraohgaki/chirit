export default class ElementAttributesProxy {

    [key: string]: string | null;

    constructor(target: Element) {
        return new Proxy({}, {
            set: (_target, name, value) => {
                value = value ?? '';
                if (typeof name === 'string' && typeof value === 'string') {
                    target.setAttribute(name, value);
                    return true;
                }
                return false;
            },
            get: (_target, name) => {
                if (typeof name === 'string') {
                    return target.getAttribute(name);
                }
                return null;
            },
            deleteProperty: (_target, name) => {
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    target.removeAttribute(name);
                    return true;
                }
                return false;
            },
            has: (_target, name) => {
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    return true;
                }
                return false;
            },
            ownKeys: () => {
                const keys = [];
                const attributes = Array.from(target.attributes);
                for (const attribute of attributes) {
                    keys.push(attribute.name);
                }
                return keys;
            },
            getOwnPropertyDescriptor: (_target, name) => {
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    return {
                        configurable: true,
                        enumerable: true,
                        value: target.getAttribute(name)
                    };
                }
                return undefined;
            }
        });
    }

}
