import {Component} from '../../chirit.js';
import store from '../store/index.js';

export default class MainContent extends Component {

    constructor() {
        super();

        store.state.searchResult.subscribe(this.update.bind(this));
    }

    template(): string {
        const searchTerm = store.state.searchTerm.get();
        const searchResult = store.state.searchResult.get();

        const title = searchTerm ? `Search for <q>${searchTerm}</q>` : '';
        let listItems = '';

        if (searchResult.resultCount) {
            for (const result of searchResult.results) {
                listItems += `
                    <li>
                    <demo-artist-album
                        artwork="${result.artworkUrl100}"
                        artist="${result.artistName}"
                        album="${result.collectionName}">
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
                max-width: 900px;
                margin: 0;
                padding: 0;
            }
            ul li {
                padding: 10px;
            }
            </style>

            <h2>${title}</h2>
            <ul>${listItems}</ul>
        `;
    }

}
