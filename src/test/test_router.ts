import {Router} from '../chirit.js';

export default function(): void {
    const main = document.getElementById('main') as Element;
    main.innerHTML = `
        <div id="router-links">
        <a href="https://example.com/">https://example.com/</a><br>
        <a href="${window.location.origin + window.location.pathname}?k=v#/test/router/dummy">${window.location.origin + window.location.pathname}?k=v#/test/router/dummy</a><br>
        <a href="${window.location.pathname}?k=v#/test/router/dummy">${window.location.pathname}?k=v#/test/router/dummy</a><br>
        <a href="?k=v#/test/router/dummy">?k=v#/test/router/dummy</a><br>
        <a href="#/test/router/dummy">#/test/router/dummy</a><br>
        <a href="/test/router/dummy">/test/router/dummy</a><br>
        <a href="/test/router/0-1">/test/router/0-1</a><br>
        <a href="2-3">2-3</a><br>
        <a href="./">./</a><br>
        <a href="../">../</a>
        </div>
    `;

    const links = document.getElementById('router-links') as Element;

    const router = new Router('hash');

    console.log(router.type);

    router.setRoute('/test/router/dummy', () => {
        console.log('dummy');
    });
    router.setRoute('/test/router/:param1-(?<param2>.+)', (params) => {
        console.log(window.location.href);
        console.log(params);
    });
    router.setRoute('.*', (params) => {
        console.log(window.location.href);
        console.log(params);
    });

    router.removeRoute('/test/router/dummy');

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
