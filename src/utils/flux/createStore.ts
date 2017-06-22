import { Reducer, Store, Subscriber } from './types';

export default function createStore<TState, TEvent>(
    reducer: Reducer<TState, TEvent>,
    state: TState
): Store<TState, TEvent> {
    const subscribers = new Set<Subscriber<TState>>();

    function getState(): TState {
        return state;
    }

    function dispatch(event: TEvent): TEvent {
        const nextState = reducer(state, event);
        for (const subscriber of subscribers) {
            subscriber(nextState);
        }
        state = nextState;
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
        dispatch,
        subscribe
    };
}
