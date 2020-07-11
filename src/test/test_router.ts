import {Router} from '../chirit.js';

export default function() {
    const prefix = '/test';
    const main = document.getElementById('main') as Element;
    main.innerHTML = `
        <div id="router-links">
        <a href="${prefix}/router/dummy">${prefix}/router/dummy</a><br>
        <a href="${prefix}/router/0-1">${prefix}/router/0-1</a><br>
        <a href="2-3">2-3</a><br>
        <a href="./">./</a><br>
        <a href="../">../</a>
        </div>
    `;

    const links = document.getElementById('router-links') as Element;

    const router = new Router('history');

    console.log(router.type);

    router.setRoute(`${prefix}/router/dummy`, () => {
        console.log('dummy');
    });
    router.setRoute(`${prefix}/router/:param1-(?<param2>.+)`, (params) => {
        console.log(window.location.href);
        console.log(params);
    });
    router.setRoute('.*', () => {
        console.log(window.location.href);
    });

    router.removeRoute(`${prefix}/router/dummy`);

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
