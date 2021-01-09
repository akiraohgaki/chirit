import {Component} from '../../chirit.js';
import store from '../store/index.js';
import {escapeHtml} from './utils.js';

export default class SearchResult extends Component {

    constructor() {
        super();
        store.state.searchResult.subscribe(this.update.bind(this));
    }

    protected template(): string {
        const searchTerm = store.state.searchTerm.get();
        const searchResult = store.state.searchResult.get();

        const title = searchTerm ? `Search for <q>${escapeHtml(searchTerm)}</q>` : '';

        let listItems = '';
        if (searchResult.resultCount) {
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
            <style>
            :host {
                display: block;
            }
            :host * {
                box-sizing: border-box;
            }
            h2 {
                text-align: center;
                font: 16px/1 system-ui;
                color: var(--fg-color);
            }
            ul {
                display: flex;
                flex-flow: row wrap;
                justify-content: center;
                list-style: none;
                max-width: 1000px;
                margin: 0;
                padding: 0;
            }
            ul li {
                padding: 1em;
            }
            </style>

            <h2>${title}</h2>
            <ul>${listItems}</ul>
        `;
    }

}
