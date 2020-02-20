interface ObservableObserver {
    (data: any): void;
}

export default class Observable {

    private _observerCollection: Set<ObservableObserver>;

    constructor(observers?: Iterable<ObservableObserver>) {
        this._observerCollection = new Set(observers);
    }

    get size(): number {
        return this._observerCollection.size;
    }

    addObserver(observer: ObservableObserver): void {
        this._observerCollection.add(observer);
    }

    removeObserver(observer: ObservableObserver): void {
        this._observerCollection.delete(observer);
    }

    notifyObservers(data: any): void {
        if (this._observerCollection.size) {
            for (const observer of this._observerCollection) {
                observer(data);
            }
        }
    }

}
