import {Router} from '../chirit.js';

export default function(): void {
    const main = document.getElementById('main') as Element;
    main.innerHTML = `
        <ul id="router-links">
        <li><a href="https://example.com/">https://example.com/</a></li>
        <li><a href="${window.location.origin + window.location.pathname}?k=v#/test/router/dummy">${window.location.origin + window.location.pathname}?k=v#/test/router/dummy</a></li>
        <li><a href="${window.location.pathname}?k=v#/test/router/dummy">${window.location.pathname}?k=v#/test/router/dummy</a></li>
        <li><a href="?k=v#/test/router/dummy">?k=v#/test/router/dummy</a></li>
        <li><a href="#/test/router/dummy">#/test/router/dummy</a></li>
        <li><a href="/test/router/dummy">/test/router/dummy</a></li>
        <li><a href="/test/router/0-1">/test/router/0-1</a></li>
        <li><a href="router/2-3">router/2-3</a></li>
        <li><a href="router/error">router/error</a></li>
        <li><a href="./">./</a></li>
        <li><a href="../">../</a></li>
        </ul>
    `;

    const links = document.getElementById('router-links') as Element;

    const router = new Router('hash', '/test/');

    console.log(router.mode);
    console.log(router.base);
    console.log(router.onerror);

    router.onerror = (exception) => {
        console.error('onerror', exception);
    };

    router.setRoute(`^${router.base}router/error`, () => {
        throw new Error(window.location.href);
    });
    router.setRoute(`^${router.base}router/dummy`, () => {
        console.log('dummy');
    });
    router.setRoute(`^${router.base}router/:param1-(?<param2>.+)`, (params) => {
        console.log(window.location.href);
        console.log(params);
    });
    router.setRoute('.*', (params) => {
        console.log(window.location.href);
        console.log(params);
    });

    router.removeRoute(`^${router.base}router/dummy`);

    router.navigate(window.location.href);

    links.addEventListener('click', (event) => {
        event.preventDefault();
        const target = event.target as Element;
        const url = target.getAttribute('href');
        if (url) {
            router.navigate(url);
        }
    });
}
