import { Middleware, Store } from '../types';

type AsyncEvent<TState, TEvent, TContext> = (store: Store<TState, TEvent>, context: TContext) => Promise<any>;

function asyncMiddlewareFactory<TState, TEvent, TContext>(
    context: TContext
): Middleware<TState, TEvent | AsyncEvent<TState, TEvent, TContext>> {
    return ({ getState, subscribe }) => (event, next) => {
        const dispatch = (event: TEvent | AsyncEvent<TState, TEvent, TContext>): any => {
            if (typeof event === 'function') {
                return event({ dispatch, getState, subscribe }, context);
            } else {
                return next(event);
            }
        };
        return dispatch(event);
    };
}

export default asyncMiddlewareFactory;
