import {Component} from '../../chirit.js';
import router from '../router/index.js';

export default class SearchBar extends Component {

    constructor() {
        super();

        this.content.container.addEventListener('submit', (event) => {
            event.preventDefault();
            const target = event.target as Element;
            const inputElement = target.querySelector('input[name="term"]') as HTMLInputElement;
            router.navigate(`search/${inputElement.value}`);
        });
    }

    template(): string {
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
