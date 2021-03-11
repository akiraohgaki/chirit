import './components/index.js';
import router from './router/index.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
    :root {
        --fg-color: #eeeeee;
        --fg-color-2nd: #aaaaaa;
        --bg-color: #222831;
        --bg-color-2nd: #222831;
        --widget-fg-color: #eeeeee;
        --widget-fg-color-2nd: #aaaaaa;
        --widget-bg-color: #222831;
        --widget-border-color: #393e46;
    }
    </style>

    <style>
    :root {
        font: 14px/1.5 system-ui;
    }

    *,
    ::before,
    ::after {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        background: var(--bg-color);
        color: var(--fg-color);
    }
    </style>

    <demo-root></demo-root>
`;
document.body.appendChild(template.content);

router.navigate(window.location.href);
