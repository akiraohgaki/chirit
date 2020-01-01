import Component from './Component.js';
import StateManager from './StateManager.js';
import Handler from './Handler.js';
import WebStorage from './WebStorage.js';
import Utility from './Utility.js';

export default class Chirit {

    static get Component(): typeof Component {
        return Component;
    }

    static get StateManager(): typeof StateManager {
        return StateManager;
    }

    static get Handler(): typeof Handler {
        return Handler;
    }

    static get WebStorage(): typeof WebStorage {
        return WebStorage;
    }

    static get Utility(): typeof Utility {
        return Utility;
    }

}
