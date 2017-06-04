import { Delegate, Middleware, Reducer, Store, Subscriber } from './types';

export default function createStore<TState, TEvent>(
    reducer: Reducer<TState, TEvent>,
    state: TState,
    middlewares: Middleware<TState, TEvent>[]
): Store<TState, TEvent> {
    const subscribers = new Set<Subscriber<TState>>();

    const context = {
        getState,
        replaceState,
        dispatch,
        subscribe
    };

    function getState(): TState {
        return state;
    }

    function replaceState(nextState: TState): void {
        state = nextState;
        for (const subscriber of subscribers) {
            subscriber(nextState);
        }
    }

    function dispatch(event: TEvent): void {
        const pipeline = createPipeline(middlewares, finalize, context, 0);
        pipeline(event);
    }

    function subscribe(subscriber: (state: TState) => void): () => void {
        subscribers.add(subscriber);

        let closed = false;

        return function subscription() {
            if (!closed) {
                closed = true;
                subscribers.delete(subscriber);
            }
        };
    }

    function finalize(event: TEvent): TEvent {
        const nextState = reducer(state, event);
        replaceState(nextState);
        return event;
    }

    return context;
}

function createPipeline<TState, TEvent>(
    middlewares: Middleware<TState, TEvent>[],
    finalize: Delegate<TEvent>,
    context: Store<TState, TEvent>,
    index: number
): Delegate<TEvent> {
    if (index < middlewares.length) {
        return function pipeline(event: TEvent) {
            const middleware = middlewares[index];
            const next = createPipeline(middlewares, finalize, context, index + 1);
            return middleware(event, next, context);
        };
    } else {
        return finalize;
    }
}
