import {Component} from '../../chirit.js';
import {store} from '../stores/index.js';
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
        let content = '';

        switch (store.state.page.get()) {
            case 'home': // Continue to search page
            case 'search': {
                content = `
                    <demo-page>
                    <demo-search-bar slot="header"></demo-search-bar>
                    <demo-search-result slot="content"></demo-search-result>
                    </demo-page>
                `;
                break;
            }
            case 'error': {
                content = `
                    <demo-page>
                    <demo-error-content slot="content"></demo-error-content>
                    </demo-page>
                `;
                break;
            }
            default: {
                content = '';
                break;
            }
        }

        return `
            <style>${styles.reset}</style>

            ${content}
        `;
    }

}
