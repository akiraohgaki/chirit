import {Component} from '../../chirit.js';
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
                margin: 0;
                color: var(--fg-color-2nd);
            }
            </style>

            <h2>Not Found</h2>
            <p><a href="${router.base}">Continue to Home</a></p>
        `;
    }

}
