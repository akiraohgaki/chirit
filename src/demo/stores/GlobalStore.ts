import type {State, Status} from '../types.js';

import {ObservableValue} from '../../chirit.js';
import {iTunesSearchApi} from '../apis/index.js';

export default class GlobalStore {

    private _state: State;

    constructor() {
        this._state = {
            status: new ObservableValue({message: ''}),
            page: new ObservableValue(''),
            searchTerm: new ObservableValue(''),
            searchResult: new ObservableValue({})
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

    setStatus(status: Status): void {
        this._state.status.set(status);
    }

    resetStatus(): void {
        this._state.status.set({message: ''});
    }

    setPage(page: string): void {
        this._state.page.set(page);
    }

    async search(term: string): Promise<void> {
        const responseData = await iTunesSearchApi.searchMusic(term);
        this._state.searchTerm.set(term);
        this._state.searchResult.set(responseData);
    }

    clearSearch(): void {
        this._state.searchTerm.set('');
        this._state.searchResult.set({});
    }

}
