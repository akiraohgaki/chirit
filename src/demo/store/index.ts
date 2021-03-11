import type {State} from '../types.js';

import {ObservableValue} from '../../chirit.js';
import api from '../api/index.js';

class Store {

    private _state: State;

    constructor() {
        this._state = {
            page: new ObservableValue(''),
            searchTerm: new ObservableValue(''),
            searchResult: new ObservableValue({}),
            error: new ObservableValue(new Error())
        };

        this._state.page.subscribe(() => {
            if (document.scrollingElement) {
                document.scrollingElement.scrollTop = 0;
                document.scrollingElement.scrollLeft = 0;
            }
        });
    }

    get state(): State {
        return this._state;
    }

    setPage(page: string): void {
        this._state.page.set(page);
    }

    resetSearch(): void {
        this._state.searchTerm.set('');
        this._state.searchResult.set({});
    }

    async search(term: string): Promise<void> {
        const responseData = await api.searchITunesMusic(term);
        this._state.searchTerm.set(term);
        this._state.searchResult.set(responseData);
    }

    setError(error: Error): void {
        this._state.error.set(error);
    }

}

export default new Store();
