import {Router} from '../../chirit.js';
import store from '../store/index.js';

const router = new Router('history', '/demo/');

router.setRoute('^/demo/search/:term', (params) => {
    store.search(decodeURIComponent(params.term));
});
router.setRoute('^/demo/.*', () => {
    store.reset();
});

export default router;
