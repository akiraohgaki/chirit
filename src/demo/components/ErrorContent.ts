import {Component} from '../../chirit.js';
import store from '../store/index.js';
import router from '../router/index.js';
import * as styles from './styles.js';

export default class NotFound extends Component {

    protected template(): string {
        return `
            <style>${styles.reset}</style>

            <style>
            h2 {
                text-align: center;
                color: var(--fg-color);
            }

            p {
                text-align: center;
                color: var(--fg-color-2nd);
            }
            </style>

            <h2>${store.state.error.get().message}</h2>
            <p><a href="${router.base}">Continue to home page</a></p>
        `;
    }

}
