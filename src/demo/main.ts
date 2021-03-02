import './components/index.js';
import {styleColors} from './components/styles.js';
import router from './router/index.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>${styleColors}</style>

    <style>
    body {
        margin: 0;
        padding: 0;
        background: var(--bg-color);
    }
    </style>

    <demo-root></demo-root>
`;
document.body.appendChild(template.content);

router.navigate(window.location.href);
