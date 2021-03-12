import {Component} from '../../chirit.js';
import store from '../store/index.js';
import * as styles from './styles.js';

export default class Root extends Component {

    constructor() {
        super();
        this.update = this.update.bind(this);
    }

    connectedCallback(): void {
        super.connectedCallback();
        store.state.page.subscribe(this.update);
    }

    disconnectedCallback(): void {
        store.state.page.unsubscribe(this.update);
    }

    protected template(): string {
        let pageView = '';
        switch (store.state.page.get()) {
            case 'search': {
                pageView = `
                    <demo-page>
                    <demo-search-bar slot="nav"></demo-search-bar>
                    <demo-search-result slot="main"></demo-search-result>
                    </demo-page>
                `;
                break;
            }
            case 'error': {
                pageView = `
                    <demo-page>
                    <demo-error-content slot="main"></demo-error-content>
                    </demo-page>
                `;
                break;
            }
            default: {
                pageView = '';
                break;
            }
        }

        return `
            <style>${styles.reset}</style>

            ${pageView}
        `;
    }

}
