import type {ITunesSearchApiResponseData} from '../types.js';

import {WebStorage} from '../../chirit.js';

class Api {

    private _iTunesSearchApiBaseUrl: string;
    private _webStorage: WebStorage;

    constructor() {
        this._iTunesSearchApiBaseUrl = 'https://itunes.apple.com/search';
        this._webStorage = new WebStorage('session', 'demo_');
    }

    async searchITunesMusic(term: string): Promise<ITunesSearchApiResponseData> {
        const url = `${this._iTunesSearchApiBaseUrl}?media=music&entity=album&term=${encodeURIComponent(term)}`;

        const iTunesSearchApiCache = this._webStorage.getItem('iTunesSearchApiCache') ?? {};

        if (!(url in iTunesSearchApiCache)) {
            const response = await window.fetch(url);

            if (!response.ok) {
                throw new Error('Network response error');
            }

            const responseData = await response.json();
            iTunesSearchApiCache[url] = responseData;
            this._webStorage.setItem('iTunesSearchApiCache', iTunesSearchApiCache);
        }

        return iTunesSearchApiCache[url] as ITunesSearchApiResponseData;
    }

}

export default new Api();
