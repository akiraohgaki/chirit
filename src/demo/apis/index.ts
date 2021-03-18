import {WebStorage} from '../../chirit.js';
import ITunesSearchApi from './ITunesSearchApi.js';

const webStorage = new WebStorage('session', 'demo_');

export const iTunesSearchApi = new ITunesSearchApi(webStorage);
