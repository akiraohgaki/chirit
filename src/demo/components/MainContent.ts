import {Component} from '../../chirit.js';
import store from '../store/index.js';

export default class MainContent extends Component {

    constructor() {
        super();

        store.state.searchResult.subscribe(this.update.bind(this));
    }

    template() {
        return `
            <style>
            :host {
                display: block;
            }
            ul {
                margin: 0;
                padding: 0;
            }
            </style>

            <ul>
            ${(() => {
                let list = '';
                const searchResult = store.state.searchResult.get();
                if (searchResult.resultCount) {
                    for (const result of searchResult.results) {
                        list += `
                            <li>
                            <app-artist-album
                                artwork="${result.artworkUrl100}"
                                artist="${result.artistName}"
                                album="${result.collectionName}">
                            </app-artist-album>
                            </li>
                        `;
                    }
                }
                return list;
            })()}
            </ul>
        `;
    }

}
