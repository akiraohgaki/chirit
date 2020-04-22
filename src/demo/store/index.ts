import Store from './Store.js';

interface AlternativeWindow extends Window {
    _store: Store;
}

declare var window: AlternativeWindow;

if (!(window._store instanceof Store)) {
    window._store = new Store();
}

const store = window._store;

export default store;
