import type {WebStorage} from '../../chirit.js';
import type {ITunesSearchApiResponseData} from '../types.js';

export default class ITunesSearchApi {

    private _baseUrl: string;
    private _webStorage: WebStorage;

    constructor(webStorage: WebStorage) {
        this._baseUrl = 'https://itunes.apple.com/search';
        this._webStorage = webStorage;
    }

    async searchMusic(term: string): Promise<ITunesSearchApiResponseData> {
        const url = `${this._baseUrl}?media=music&entity=album&term=${encodeURIComponent(term)}`;

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
