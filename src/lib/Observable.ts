interface ObservableObserver {
    (data: any): void;
}

interface ObservableNotifyHandler {
    (data: any, observer: ObservableObserver, option: any): void;
}

export default class Observable {

    private _observerCollection: Map<ObservableObserver, any>;

    constructor(observers: Iterable<[ObservableObserver, any]> = []) {
        this._observerCollection = new Map(observers);
    }

    get size(): number {
        return this._observerCollection.size;
    }

    subscribe(observer: ObservableObserver, option: any = null): void {
        this._observerCollection.set(observer, option);
    }

    unsubscribe(observer: ObservableObserver): void {
        this._observerCollection.delete(observer);
    }

    notify(data: any, handler?: ObservableNotifyHandler): void {
        if (this._observerCollection.size) {
            for (const [observer, option] of this._observerCollection) {
                if (handler) {
                    handler(data, observer, option);
                }
                else {
                    observer(data);
                }
            }
        }
    }

}
