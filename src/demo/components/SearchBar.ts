import {Component} from '../../chirit.js';
import {router} from '../routers/index.js';
import * as styles from './styles.js';

export default class SearchBar extends Component {

    protected template(): string {
        return `
            <style>${styles.reset}</style>

            <style>
            :host {
                display: inline-block;
                box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);
                width: 30rem;
                height: 2.5rem;
            }

            form {
                display: flex;
                flex-flow: row nowrap;
                width: 100%;
                height: 100%;
            }

            input {
                border: 2px solid var(--widget-border-color);
            }

            input[type="text"] {
                flex: auto;
                border-right-width: 0;
                border-radius: 5px 0 0 5px;
                background: var(--widget-bg-color);
                color: var(--widget-fg-color);
            }

            input[type="submit"] {
                border-left-width: 0;
                border-radius: 0 5px 5px 0;
                background: var(--widget-border-color);
                color: var(--widget-fg-color-2nd);
            }
            input[type="submit"]:hover {
                color: var(--widget-fg-color);
            }
            </style>

            <form onsubmit="this.handleSubmit(event)">
            <input type="text" name="term" value="" placeholder="Search for Artist Album" required>
            <input type="submit" value="Search">
            </form>
        `;
    }

    protected handleSubmit(event: Event): void {
        event.preventDefault();
        const target = event.target as Element;
        const inputElement = target.querySelector('input[name="term"]') as HTMLInputElement;
        router.navigate(`search/${encodeURIComponent(inputElement.value)}`);
    }

}
