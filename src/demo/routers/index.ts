import {Router} from '../../chirit.js';
import {store} from '../stores/index.js';

export const router = new Router('history', '/demo/');

router.setRoute(`^${router.base}search/:term`, async (params) => {
    try {
        await store.search(decodeURIComponent(params.term));
        store.setPage('search');
    }
    catch (exeption) {
        store.setStatus(exeption);
        store.setPage('error');
    }
});
router.setRoute(`^${router.base}$`, () => {
    store.clearSearch();
    store.setPage('home');
});
router.setRoute('.*', () => {
    store.setStatus(new Error('Page not found'));
    store.setPage('error');
});

router.onchange = () => {
    store.resetStatus();
};
