import {Component} from '../../chirit.js';

export default class ArtistAlbum extends Component {

    static get observedAttributes() {
        return ['artwork', 'artist', 'album'];
    }

    template() {
        return `
            <style>
            :host {
                display: block;
            }
            div {
                box-sizing: border-box;
                display: flex;
                width: 100%;
                padding: 20px;
            }
            div img {
                display: inline-block;
                width: 100px;
                height: 100px;
                margin-right: 20px;
            }
            div span {
                display: inline-block;
            }
            </style>

            <div>
            <img src="${this.attrs.artwork}">
            <span>
            ${this.attrs.artist}<br>
            ${this.attrs.album}
            </span>
            </div>
        `;
    }

}
