import {Router} from '../../chirit.js';
import store from '../store/index.js';

const router = new Router('history', '/demo/');

router.setRoute(`^${router.base}search/:term`, (params) => {
    store.search(decodeURIComponent(params.term));
});
router.setRoute(`^${router.base}.*`, () => {
    store.reset();
});

export default router;
