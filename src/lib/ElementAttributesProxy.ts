export default class ElementAttributesProxy {

    [key: string]: string;

    constructor(target: Element) {
        return new Proxy({}, {
            set: (_target, name, value) => {
                if (typeof name === 'string' && typeof value === 'string') {
                    target.setAttribute(name, value);
                    return true;
                }
                return false;
            },
            get: (_target, name) => {
                // Return undefined instead of null if attribute is not exist
                if (typeof name === 'string' && target.hasAttribute(name)) {
                    return target.getAttribute(name);
                }
                return undefined;
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
                if (target.hasAttributes()) {
                    const attributes = target.attributes;
                    for (let i = 0; i < attributes.length; i++) {
                        keys.push(attributes[i].name);
                    }
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
