import { Middleware, Store } from './types';

export default function applyMiddlewares<TState, TEvent>(
    store: Store<TState, TEvent>,
    middlewares: Middleware<TState, TEvent>[]
): Store<TState, TEvent> {
    const enhancedStore = { ...store };

    enhancedStore.dispatch = middlewares.reverse().reduce((acc, middleware) => {
        const handler = middleware(enhancedStore);
        return (event: TEvent) => handler(event, acc);
    }, store.dispatch);

    return enhancedStore;
}
