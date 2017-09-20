import { Reducer, Store, Subscriber } from './types';

export default function createStore<TState, TEvent>(
    reducer: Reducer<TState, TEvent>,
    state: TState
): Store<TState, TEvent> {
    const subscribers = new Set<Subscriber<TState>>();

    function getState(): TState {
        return state;
    }

    function replaceState(nextState: TState): void {
        state = nextState;
        for (const subscriber of subscribers) {
            subscriber(nextState);
        }
    }

    function dispatch(event: TEvent): TEvent {
        const nextState = reducer(state, event);
        replaceState(nextState);
        return event;
    }

    function subscribe(subscriber: (state: TState) => void): () => void {
        subscribers.add(subscriber);

        let closed = false;

        return function unsubscribe() {
            if (!closed) {
                closed = true;
                subscribers.delete(subscriber);
            }
        };
    }

    return {
        getState,
        replaceState,
        dispatch,
        subscribe
    };
}
