import {WebStorage} from '../chirit.js';

export default function(): void {
    const webStorage = new WebStorage('session', 'test_');

    console.log(webStorage.type);
    console.log(webStorage.prefix);

    sessionStorage.setItem(`${webStorage.prefix}item0`, 'dummy');
    webStorage.setItem('item1', 'dummy');
    webStorage.setItem('item2', 0);
    webStorage.setItem('item3', [1,2,3]);
    webStorage.setItem('item4', {dummy: true});
    webStorage.setItem('item5', null);
    webStorage.setItem('item6', undefined);

    console.log(webStorage.getItem('item0'));
    console.log(webStorage.getItem('item1'));
    console.log(webStorage.getItem('item2'));
    console.log(webStorage.getItem('item3'));
    console.log(webStorage.getItem('item4'));
    console.log(webStorage.getItem('item5'));
    console.log(webStorage.getItem('item6'));

    webStorage.removeItem('item0');
    console.log(webStorage.getItem('item0'));

    console.log(webStorage.length);
    console.log(webStorage.key(1));

    webStorage.clear();
}
