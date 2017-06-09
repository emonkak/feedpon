import { Middleware, Store } from '../types';

function errorHandlingMiddlewareFactory<TState, TEvent>(handler: (error: any, store: Store<TState, TEvent>) => void): Middleware<TState, TEvent> {
    return (store) => (event, next) => {
        const result = next(event);

        if (result instanceof Promise) {
            return result.catch((error) => {
                handler(error, store);
                return Promise.reject(error);
            });
        }

        return result;
    };
}

export default errorHandlingMiddlewareFactory;
