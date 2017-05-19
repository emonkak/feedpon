import { Delegate, Middleware } from '../types';

export default function errorHandlingMiddlewareFactory<TState, TEvent>(
    handler: (error: any, dispatch: Delegate<TEvent>, getState: () => TState) => void
): Middleware<TState, TEvent> {
    return function errorHandlingMiddleware(event, next, { getState }) {
        const result = next(event);

        return result instanceof Promise
            ? result.catch((error) => handler(error, next, getState))
            : result;
    };
}
