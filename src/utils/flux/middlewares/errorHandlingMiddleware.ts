import { Middleware, Store } from '../types';

function errorHandlingMiddlewareFactory<TState, TEvent>(handler: (error: any, store: Store<TState, TEvent>) => void): Middleware<TState, TEvent> {
    return (store) => (event, next) => {
        const result = next(event);

        return result instanceof Promise
            ? result.catch((error) => handler(error, store))
            : result;
    };
}

export default errorHandlingMiddlewareFactory;
