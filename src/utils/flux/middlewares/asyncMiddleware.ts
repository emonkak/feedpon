import { Middleware } from '../types';

function asyncMiddlewareFactory<TState, TEvent>(context: any = {}): Middleware<TState, TEvent> {
    return (store) => (event, next) => {
        if (typeof event === 'function') {
            return event(store, context);
        } else {
            return next(event);
        }
    };
}

export default asyncMiddlewareFactory;
