import {ObservableValue, WebStorage} from '../../chirit.js';

interface ApiResult {
    [key: string]: any;
}

interface State {
    page: ObservableValue<string>;
    searchTerm: ObservableValue<string>;
    searchResult: ObservableValue<ApiResult>;
}

export default class Store {

    private _state: State;

    private _webStorage: WebStorage;

    constructor() {
        this._state = {
            page: new ObservableValue(''),
            searchTerm: new ObservableValue(''),
            searchResult: new ObservableValue({})
        };

        this._webStorage = new WebStorage('session', 'demo_');

        this._state.searchResult.subscribe(() => {
            if (document.scrollingElement) {
                document.scrollingElement.scrollTop = 0;
            }
        });
    }

    get state(): State {
        return this._state;
    }

    setPage(page: string): void {
        if (this._state.page.get() !== page) {
            this._state.page.set(page);
        }
    }

    resetSearch(): void {
        this._state.searchTerm.set('');
        this._state.searchResult.set({});
    }

    async search(term: string): Promise<void> {
        try {
            const url = `https://itunes.apple.com/search?media=music&entity=album&term=${encodeURIComponent(term)}`;

            const searchResultsCache = this._webStorage.getItem('searchResultsCache') ?? {};

            if (!(url in searchResultsCache)) {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network error');
                }
                const result = await response.json();
                searchResultsCache[url] = result;
                this._webStorage.setItem('searchResultsCache', searchResultsCache);
            }

            this._state.searchTerm.set(term);
            this._state.searchResult.set(searchResultsCache[url]);
        }
        catch (error) {
            console.error(error);
        }
    }

}
