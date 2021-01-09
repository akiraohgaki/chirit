import {Component} from '../../chirit.js';
import store from '../store/index.js';

export default class Root extends Component {

    constructor() {
        super();
        store.state.page.subscribe(this.update.bind(this));
    }

    protected template(): string {
        const page = store.state.page.get();

        let pageView = '';
        if (page === 'search') {
            pageView = `
                <demo-page>
                <demo-search-bar slot="nav"></demo-search-bar>
                <demo-search-result slot="main"></demo-search-result>
                </demo-page>
            `;
        }
        else if (page === 'notfound') {
            pageView = `
                <demo-page>
                <demo-not-found slot="main"></demo-not-found>
                </demo-page>
            `;
        }

        return `
            <style>
            :host {
                display: block;
            }
            :host * {
                box-sizing: border-box;
            }
            </style>

            ${pageView}
        `;
    }

}
