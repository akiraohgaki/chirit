import {Component} from '../../chirit.js';
import * as styles from './styles.js';

export default class Page extends Component {

    protected template(): string {
        return `
            <style>${styles.reset}</style>

            <style>
            nav,
            article {
                display: flex;
                flex-flow: column nowrap;
                align-items: center;
                padding: 1rem;
            }

            nav {
                background: var(--bg-color-2nd);
            }

            article {
                background: var(--bg-color);
            }
            </style>

            <nav><slot name="nav"></slot></nav>
            <article><slot name="main"></slot></article>
        `;
    }

}
