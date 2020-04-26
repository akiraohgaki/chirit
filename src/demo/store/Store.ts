import {ObservableValue} from '../../chirit.js';

interface ApiResult {
    [key: string]: any;
}

interface State {
    searchResult: ObservableValue<ApiResult>;
}

export default class Store {

    private _state: State;

    constructor() {
        this._state = {
            searchResult: new ObservableValue({})
        };
    }

    get state() {
        return this._state;
    }

    async search(term: string) {
        const response = await fetch(`https://itunes.apple.com/search?media=music&entity=album&term=${term}`);
        if (response.ok) {
            const result = await response.json();
            this._state.searchResult.set(result);
        }
    }

}
