import type {ObservableValue} from '../chirit.js';

export interface ITunesSearchApiResponseData {
    resultCount?: number;
    results?: Array<{artistName: string, artworkUrl100: string, collectionName: string}>;
}

export interface State {
    page: ObservableValue<string>;
    searchTerm: ObservableValue<string>;
    searchResult: ObservableValue<ITunesSearchApiResponseData>;
    error: ObservableValue<Error>;
}
