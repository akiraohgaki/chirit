import {ElementAttributesProxy} from '../chirit.js';

export default function(): void {
    const element = document.createElement('a');

    const attrs = new ElementAttributesProxy(element);

    attrs.href = 'dummy';
    attrs.title = 'dummy';
    attrs['data-dummy'] = 'dummy';

    console.log(attrs.title);

    delete attrs.title;

    console.log('href' in attrs);
    console.log('title' in attrs);

    console.log(Reflect.ownKeys(attrs));
    console.log(Object.keys(attrs));

    console.log(JSON.stringify(attrs));

    console.log(attrs);
    console.log(element);
}
