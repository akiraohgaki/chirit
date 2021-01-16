import {Component} from '../../chirit.js';
import router from '../router/index.js';

export default class SearchBar extends Component {

    protected template(): string {
        return `
            <style>
            :host {
                display: inline-block;
                box-shadow: 0 0 0.4em rgba(0, 0, 0, 0.3);
                width: 500px;
                height: 40px;
            }
            :host * {
                box-sizing: border-box;
            }
            form {
                display: flex;
                flex-flow: row nowrap;
                width: 100%;
                height: 100%;
            }
            input {
                -moz-appearance: none;
                -webkit-appearance: none;
                appearance: none;
                outline: none;
                border: 2px solid var(--widget-border-color);
                font: 14px/1 system-ui;
            }
            input[type="text"] {
                flex: auto;
                border-right-width: 0;
                border-radius: 5px 0 0 5px;
                color: var(--widget-fg-color);
                background: var(--widget-bg-color);
            }
            input[type="submit"] {
                border-left-width: 0;
                border-radius: 0 5px 5px 0;
                color: var(--widget-fg-color-2nd);
                background: var(--widget-border-color);
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
