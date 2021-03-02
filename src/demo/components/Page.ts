import {Component} from '../../chirit.js';
import {styleReset} from './styles.js';

export default class Page extends Component {

    protected template(): string {
        return `
            <style>${styleReset}</style>

            <style>
            nav,
            article {
                display: flex;
                flex-flow: column nowrap;
                align-items: center;
                padding: 1em;
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
