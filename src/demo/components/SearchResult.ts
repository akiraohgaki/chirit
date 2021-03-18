import {Component} from '../../chirit.js';
import {store} from '../stores/index.js';
import {escapeHtml} from './utils.js';
import * as styles from './styles.js';

export default class SearchResult extends Component {

    constructor() {
        super();

        this.update = this.update.bind(this);
    }

    connectedCallback(): void {
        super.connectedCallback();

        store.state.searchResult.subscribe(this.update);
    }

    disconnectedCallback(): void {
        store.state.searchResult.unsubscribe(this.update);
    }

    protected template(): string {
        const searchTerm = store.state.searchTerm.get();
        const searchResult = store.state.searchResult.get();

        const title = searchTerm ? `Search for <q>${escapeHtml(searchTerm)}</q>` : '';

        let listItems = '';

        if (searchResult.results?.length) {
            for (const result of searchResult.results) {
                listItems += `
                    <li>
                    <demo-artist-album
                        artwork="${result.artworkUrl100}"
                        album="${escapeHtml(result.collectionName)}"
                        artist="${escapeHtml(result.artistName)}">
                    </demo-artist-album>
                    </li>
                `;
            }
        }

        return `
            <style>${styles.reset}</style>

            <style>
            h2 {
                text-align: center;
                color: var(--fg-color);
            }

            ul {
                display: grid;
                max-width: 1000px;
                grid-template-columns: repeat(auto-fill, 200px);
                grid-gap: 2rem;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            </style>

            <h2>${title}</h2>
            <ul>${listItems}</ul>
        `;
    }

}
