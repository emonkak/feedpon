type Delegate<TEvent> = (event: TEvent) => void;

type Middleware<TEvent, TState> = (event: TEvent, next: Delegate<TEvent>, getState: () => TState) => void;

type Reducer<TEvent, TState> = (state: TState, event: TEvent) => TState;

interface Subscription {
    unsubscribe(): void;
    readonly closed: boolean;
}

interface PartialObserver<T> {
    start?: (subscription: Subscription) => void;
    next?: (value: T) => void;
    error?: (errorValue: any) => void;
    complete?: () => void;
}

const $$observable = (Symbol as any).observable || '@@observable';

export default class Store<TEvent, TState> {
    private readonly observers: Set<Observer<TState>> = new Set();

    private readonly middlewares: Middleware<TEvent, TState>[] = [];

    private readonly finalize: Delegate<TEvent>;

    constructor(private readonly reducer: Reducer<TEvent, TState>,
                private state: TState) {
        this.getState = this.getState.bind(this);

        this.finalize = (event: TEvent): void => {
            const nextState = this.reducer(this.state, event);
            this.replaceState(nextState);
        };
    }

    getState(): TState {
        return this.state;
    }

    dispatch(event: TEvent): void {
        const pipeline = createPipeline(this.middlewares, this.getState, this.finalize, 0);
        pipeline(event);
    }

    replaceState(nextState: TState): void {
        this.state = nextState;
        this.observers.forEach(observer => observer.next(nextState));
    }

    pipe(middleware: Middleware<TEvent, TState>): this {
        this.middlewares.push(middleware);
        return this;
    }

    subscribe(nextOrObserver: ((value: TState) => void) | PartialObserver<TState>,
              error?: (errorValue?: any) => void,
              complete?: () => void): Subscription {
        const observer = toObserver(nextOrObserver, error, complete);
        const observers = this.observers;

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

function createPipeline<TEvent, TState>(middlewares: Middleware<TEvent, TState>[], getState: () => TState, finalize: Delegate<TEvent>, index: number): Delegate<TEvent> {
    return (event: TEvent) => {
        if (index < middlewares.length) {
            const middleware = middlewares[index];
            const next = createPipeline(middlewares, getState, finalize, index + 1);
            middleware(event, next, getState);
        } else {
            finalize(event);
        }
    };
}

function toObserver<T>(nextOrObserver: PartialObserver<T> | ((value: T) => void),
                       error?: (errorValue: any) => void,
                       complete?: () => void): Observer<T> {
    if (typeof nextOrObserver === 'function') {
        return new Observer({ next: nextOrObserver, error, complete });
    } else {
        return new Observer(nextOrObserver);
    }
}

class Observer<T> {
    constructor(private readonly observer: PartialObserver<T>) {
    }

    start(subscription: Subscription): void {
        if (this.observer.start) {
            this.observer.start(subscription);
        }
    }

    next(value: T): void {
        if (this.observer.next) {
            this.observer.next(value);
        }
    }

    error(errorValue: any) {
        if (this.observer.error) {
            this.observer.error(errorValue);
        }
    }

    complete() {
        if (this.observer.complete) {
            this.observer.complete();
        }
    }
}
