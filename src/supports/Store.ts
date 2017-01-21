import $$observable from 'symbol-observable';

type Delegate<TAction> = (action: TAction) => void;

type Middleware<TAction> = (action: TAction, next: Delegate<TAction>) => void;

type Reducer<TAction, TState> = (state: TState, action: TAction) => TState;

type Subscription = {
    unsubscribe(): void,
    readonly closed: boolean,
};

type Observer<T> = {
    next?: (value: T) => void,
    error?: (errorValue: any) => void,
    complete?: (completeValue?: any) => void,
};

export default class Store<TAction, TState> {
    private readonly _observers: Set<Observer<TState>> = new Set();

    private readonly _middlewares: Middleware<TAction>[] = [];

    private readonly _finalize: Delegate<TAction>;

    constructor(private readonly _reducer: Reducer<TAction, TState>,
                private _state: TState) {
        this._finalize = (action: TAction): void => {
            const nextState = this._reducer(this._state, action);
            this.replaceState(nextState);
        };
    }

    get state(): TState {
        return this._state;
    }

    dispatch(action: TAction): void {
        const pipeline = createPipeline(this._middlewares, this._finalize);
        pipeline(action);
    }

    replaceState(nextState: TState): void {
        this._state = nextState;
        this._observers.forEach(observer => observer.next(nextState));
    }

    pipe(middleware: Middleware<TAction>): this {
        this._middlewares.push(middleware);
        return this;
    }

    subscribe(nextOrObserver: ((value: TState) => void) | Observer<TState>,
              error?: (errorValue?: any) => void,
              complete?: (completeValue?: any) => void): Subscription {
        const observer = toObserver(nextOrObserver, error, complete);
        const observers = this._observers;

        let closed = false;

        observers.add(observer);

        return {
            get closed() {
                return closed;
            },

            unsubscribe() {
                if (!closed) {
                    observers.delete(observer);
                }
            }
        };
    }

    [$$observable](): this {
        return this;
    }
}

function createPipeline<TAction>(middlewares: Middleware<TAction>[], finalize: Delegate<TAction>): Delegate<TAction> {
    let i = 0;

    const { length } = middlewares;

    return function next(action: TAction): void {
        if (i < length) {
            const middleware = middlewares[i++];
            middleware(action, next);
        } else {
            finalize(action);
        }
    };
}

function toObserver<T>(nextOrObserver: Observer<T> | ((value: T) => void),
                       error: (errorValue: any) => void,
                       complete: (completeValue?: any) => void): Observer<T> {
    if (typeof nextOrObserver === 'function') {
        return { next: nextOrObserver, error, complete };
    } else {
        return nextOrObserver;
    }
}
