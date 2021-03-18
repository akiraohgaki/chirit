import {Component} from '../../chirit.js';
import {store} from '../stores/index.js';
import {router} from '../routers/index.js';
import * as styles from './styles.js';

export default class NotFound extends Component {

    protected template(): string {
        return `
            <style>${styles.reset}</style>

            <style>
            :host {
                text-align: center;
            }

            h2 {
                color: var(--fg-color);
            }

            p {
                color: var(--fg-color-2nd);
            }
            </style>

            <h2>${store.state.status.get().message}</h2>
            <p><a href="${router.base}">Continue to home page</a></p>
        `;
    }

}
