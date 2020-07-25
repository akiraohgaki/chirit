import {Component} from '../../chirit.js';

export default class Root extends Component {

    template(): string {
        return `
            <style>
            :host {
                display: block;
            }
            nav,
            article {
                display: block;
            }
            </style>

            <nav><slot name="nav"></slot></nav>
            <article><slot name="main"></slot></article>
        `;
    }

}
