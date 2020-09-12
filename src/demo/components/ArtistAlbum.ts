import {Component} from '../../chirit.js';

export default class ArtistAlbum extends Component {

    static get observedAttributes(): Array<string> {
        return ['artwork', 'artist', 'album'];
    }

    template(): string {
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
            .artwork,
            .album,
            .artist {
                display: block;
                font: 14px/1.4 system-ui;
            }
            .artwork {
                height: 200px;
            }
            .album {
                margin: 5px 0;
                font-weight: bold;
                color: var(--fg-color);
            }
            .artist {
                font-size: 12px;
                color: var(--fg-color-2nd);
            }
            </style>

            <div>
            <img class="artwork" src="${this.attrs.artwork}">
            <h4 class="album">${this.attrs.album}</h4>
            <span class="artist">${this.attrs.artist}</span>
            </div>
        `;
    }

}
