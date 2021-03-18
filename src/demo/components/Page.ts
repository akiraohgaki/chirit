import {Component} from '../../chirit.js';
import * as styles from './styles.js';

export default class Page extends Component {

    protected template(): string {
        return `
            <style>${styles.reset}</style>

            <style>
            :host {
                display: grid;
                grid-template:
                    'header' 6rem
                    'content' 1fr;
                place-items: center;
                background: var(--bg-color);
                color: var(--fg-color);
            }

            header,
            main {
                padding: 1rem;
            }

            header {
                grid-area: header;
            }

            main {
                grid-area: content;
                align-self: start;
            }
            </style>

            <header><slot name="header"></slot></header>
            <main><slot name="content"></slot></main>
        `;
    }

}
