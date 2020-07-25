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

    get state(): State {
        return this._state;
    }

    reset(): void {
        this._state.searchResult.set({});
    }

    async search(term: string): Promise<void> {
        const response = await fetch(`https://itunes.apple.com/search?media=music&entity=album&term=${term}`);
        if (response.ok) {
            const result = await response.json();
            this._state.searchResult.set(result);
        }
    }

}
