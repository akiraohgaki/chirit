import {Router} from '../../chirit.js';
import store from '../store/index.js';

const router = new Router('history', '/demo/');

router.setRoute(`^${router.base}search/:term`, (params) => {
    store.setPage('search');
    store.search(decodeURIComponent(params.term));
});
router.setRoute(`^${router.base}$`, () => {
    store.setPage('search');
    store.resetSearch();
});
router.setRoute(`^${router.base}.*`, () => {
    store.setPage('notfound');
});

export default router;
