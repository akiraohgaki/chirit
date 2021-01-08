import {Component} from '../../chirit.js';
import router from '../router/index.js';
import {escapeHtml} from './utils.js';

export default class ArtistAlbum extends Component {

    static get observedAttributes(): Array<string> {
        return ['artwork', 'album', 'artist'];
    }

    protected template(): string {
        return `
            <style>
            :host {
                display: inline-block;
            }
            :host * {
                box-sizing: border-box;
            }
            div {
                display: flex;
                flex-flow: column nowrap;
                width: 200px;
            }
            img {
                display: inline-block;
                box-shadow: 0 0 0.4em rgba(0, 0, 0, 0.3);
                width: 200px;
                height: 200px;
            }
            h4 {
                margin: 0.6em 0;
                font: 14px/1.4 system-ui;
                color: var(--fg-color);
            }
            p {
                margin: 0;
                font: 12px/1.4 system-ui;
                color: var(--fg-color-2nd);
            }
            a {
                color: inherit;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
            </style>

            <div onclick="this.handleClick(event)">
            <img src="${this.attrs.artwork}">
            <h4><a href="#" data-url="search/${encodeURIComponent(this.attrs.album)}">${escapeHtml(this.attrs.album)}</a></h4>
            <p><a href="#" data-url="search/${encodeURIComponent(this.attrs.artist)}">${escapeHtml(this.attrs.artist)}</a></p>
            </div>
        `;
    }

    protected handleClick(event: Event): void {
        event.preventDefault();
        const target = event.target as Element;
        const url = target.getAttribute('data-url');
        if (url) {
            router.navigate(url);
        }
    }

}
