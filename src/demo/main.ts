import './components/index.js';
import router from './router/index.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
    :root {
        --fg-color: #ffffff;
        --fg-color-2nd: #e4e3e3;
        --bg-color: #1b262c;
        --bg-color-2nd: #1b262c;

        --widget-fg-color: #ffffff;
        --widget-fg-color-2nd: #e4e3e3;
        --widget-bg-color: #1b262c;
        --widget-border-color: #6a2c70;
    }
    </style>

    <style>
    body {
        margin: 0;
        padding: 0;
        background: var(--bg-color);
    }
    </style>

    <demo-root>
    <demo-search-bar slot="nav"></demo-search-bar>
    <demo-main-content slot="main"></demo-main-content>
    </demo-root>
`;
document.body.appendChild(template.content);

router.navigate(window.location.href);
