interface ObservableObserver {
    (value: any, addition: any): void;
}

interface ObservableNotifyHandler {
    (value: any, observer: ObservableObserver, addition: any): void;
}

export default class Observable {

    private _observerCollection: Map<ObservableObserver, any>;

    constructor(entries: Iterable<[ObservableObserver, any]> = []) {
        this._observerCollection = new Map(entries);
    }

    subscribe(observer: ObservableObserver, addition: any = null): void {
        this._observerCollection.set(observer, addition);
    }

    unsubscribe(observer: ObservableObserver): void {
        this._observerCollection.delete(observer);
    }

    notify(value: any, handler?: ObservableNotifyHandler): void {
        if (this._observerCollection.size) {
            for (const [observer, addition] of this._observerCollection) {
                if (handler) {
                    handler(value, observer, addition);
                }
                else {
                    observer(value, addition);
                }
            }
        }
    }

}
