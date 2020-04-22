import Chirit from '../../chirit.js';
import store from '../store/index.js';

export default class SearchBar extends Chirit.Component {

    constructor() {
        super();

        this.contentRoot.addEventListener('submit', (event) => {
            event.preventDefault();
            const target = event.target as Element;
            const inputElement = target.querySelector('input[name="term"]') as HTMLInputElement;
            store.search(inputElement.value);
        });
    }

    template() {
        return `
            <style>
            :host {
                display: block;
            }
            input {
                width: 400px;
            }
            </style>

            <form>
            <input type="search" name="term" value="" placeholder="Search for Artist Album">
            </form>
        `;
    }

}
