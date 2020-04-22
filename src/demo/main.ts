import './components/index.js';

const template = document.createElement('template');
template.innerHTML = `
    <app-root>
    <app-search-bar slot="nav"></app-search-bar>
    <app-main-content slot="main"></app-main-content>
    </app-root>
`;
document.body.appendChild(template.content);
