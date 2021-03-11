import {Router} from '../../chirit.js';
import store from '../store/index.js';

const router = new Router('history', '/demo/');

router.setRoute(`^${router.base}search/:term`, async (params) => {
    try {
        await store.search(decodeURIComponent(params.term));
        store.setPage('search');
    }
    catch (exeption) {
        store.setError(exeption);
        store.setPage('error');
    }
});
router.setRoute(`^${router.base}$`, () => {
    store.resetSearch();
    store.setPage('search');
});
router.setRoute('.*', () => {
    store.setError(new Error('Page not found'));
    store.setPage('error');
});

export default router;
