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
            ul li {
                display: flex;
                margin: 0;
                padding: 20px;
            }
            ul li img {
                display: inline-block;
                width: 100px;
                height: 100px;
                margin-right: 20px;
            }
            ul li span {
                display: inline-block;
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
                            <img src="${result.artworkUrl100}">
                            <span>
                            ${result.artistName}<br>
                            ${result.collectionName}
                            </span>
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
