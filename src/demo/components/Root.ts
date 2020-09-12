import {Component} from '../../chirit.js';

export default class Root extends Component {

    template(): string {
        return `
            <style>
            :host {
                display: block;
            }
            :host * {
                box-sizing: border-box;
            }
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
