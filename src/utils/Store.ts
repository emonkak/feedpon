type Delegate<TEvent> = (event: TEvent) => void;

type Middleware<TEvent> = (event: TEvent, next: Delegate<TEvent>) => void;

type Reducer<TEvent, TState> = (state: TState, event: TEvent) => TState;

type Subscription = {
    unsubscribe(): void,
    readonly closed: boolean,
};

type PartialObserver<T> = {
    start?: (subscription : Subscription) => void;
    next?: (value: T) => void,
    error?: (errorValue: any) => void,
    complete?: () => void,
};

const $$observable = (Symbol as any).observable || '@@observable';

export default class Store<TEvent, TState> {
    private readonly _observers: Set<Observer<TState>> = new Set();

    private readonly _middlewares: Middleware<TEvent>[] = [];

    private readonly _finalize: Delegate<TEvent>;

    constructor(private readonly _reducer: Reducer<TEvent, TState>,
                private _state: TState) {
        this._finalize = (event: TEvent): void => {
            const nextState = this._reducer(this._state, event);
            this.replaceState(nextState);
        };
    }

    get state(): TState {
        return this._state;
    }

    dispatch(event: TEvent): void {
        const pipeline = createPipeline(this._middlewares, this._finalize, 0);
        pipeline(event);
    }

    replaceState(nextState: TState): void {
        this._state = nextState;
        this._observers.forEach(observer => observer.next(nextState));
    }

    pipe(middleware: Middleware<TEvent>): this {
        this._middlewares.push(middleware);
        return this;
    }

    subscribe(nextOrObserver: ((value: TState) => void) | PartialObserver<TState>,
              error?: (errorValue?: any) => void,
              complete?: () => void): Subscription {
        const observer = toObserver(nextOrObserver, error, complete);
        const observers = this._observers;

        observers.add(observer);

        let closed = false;

        const subscription = {
            get closed() {
                return closed;
            },

            unsubscribe() {
                if (!closed) {
                    closed = true;
                    observers.delete(observer);
                }
            }
        };

        observer.start(subscription);

        return subscription;
    }

    [$$observable](): this {
        return this;
    }
}

function createPipeline<TEvent>(middlewares: Middleware<TEvent>[], finalize: Delegate<TEvent>, index: number): Delegate<TEvent> {
    return (event: TEvent) => {
        if (index < middlewares.length) {
            const middleware = middlewares[index];
            const next = createPipeline(middlewares, finalize, index + 1);
            middleware(event, next);
        } else {
            finalize(event);
        }
    };
}

function toObserver<T>(nextOrObserver: PartialObserver<T> | ((value: T) => void),
                       error: (errorValue: any) => void,
                       complete: () => void): Observer<T> {
    if (typeof nextOrObserver === 'function') {
        return new Observer({ next: nextOrObserver, error, complete });
    } else {
        return new Observer(nextOrObserver);
    }
}

class Observer<T> {
    constructor(private readonly _observer: PartialObserver<T>) {
    }

    start(subscription: Subscription): void {
        if (this._observer.start) {
            this._observer.start(subscription);
        }
    }

    next(value: T): void {
        if (this._observer.next) {
            this._observer.next(value);
        }
    }

    error(errorValue: any) {
        if (this._observer.error) {
            this._observer.error(errorValue);
        }
    }

    complete() {
        if (this._observer.complete) {
            this._observer.complete();
        }
    }
}
