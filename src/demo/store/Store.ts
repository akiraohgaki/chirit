import {Observable} from '../../chirit.js';

interface State {
    searchResult: Observable;
}

export default class Store {

    private _state: State;

    constructor() {
        this._state = {
            searchResult: new Observable({})
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
