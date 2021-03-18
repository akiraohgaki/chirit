import type {ObservableValue} from '../chirit.js';

export interface State {
    status: ObservableValue<Status>;
    page: ObservableValue<string>;
    searchTerm: ObservableValue<string>;
    searchResult: ObservableValue<ITunesSearchApiResponseData>;
}

export interface Status {
    message: string;
}

export interface ITunesSearchApiResponseData {
    resultCount?: number;
    results?: Array<{artistName: string, artworkUrl100: string, collectionName: string}>;
}
