import {Component} from '../../chirit.js';
import router from '../router/index.js';

export default class NotFound extends Component {

    protected template(): string {
        return `
            <style>
            :host {
                display: block;
            }
            :host * {
                box-sizing: border-box;
            }
            h2 {
                text-align: center;
                font: 16px/1 system-ui;
                color: var(--fg-color);
            }
            p {
                margin: 0;
                font: 12px/1.4 system-ui;
                color: var(--fg-color-2nd);
            }
            a {
                color: inherit;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
            </style>

            <h2>Not Found</h2>
            <p><a href="${router.base}">Back to Home</a></p>
        `;
    }

}
