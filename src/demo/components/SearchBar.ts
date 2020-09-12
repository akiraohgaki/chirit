import {Component} from '../../chirit.js';
import router from '../router/index.js';

export default class SearchBar extends Component {

    constructor() {
        super();

        this.content.container.addEventListener('submit', (event) => {
            event.preventDefault();
            const target = event.target as Element;
            const inputElement = target.querySelector('input[name="term"]') as HTMLInputElement;
            router.navigate(`search/${encodeURIComponent(inputElement.value)}`);
        });
    }

    template(): string {
        return `
            <style>
            :host {
                display: inline-block;
                width: 480px;
                height: 32px;
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

            <form>
            <input type="text" name="term" value="" placeholder="Search for Artist Album">
            <input type="submit" value="Search">
            </form>
        `;
    }

}
