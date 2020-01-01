import Component from './Component';
import StateManager from './StateManager';
import Handler from './Handler';
import WebStorage from './WebStorage';
import Utility from './Utility';

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
