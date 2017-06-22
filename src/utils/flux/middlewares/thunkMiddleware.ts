import { Middleware, Store } from '../types';

type Thunk<TState, TEvent, TContext> = <TResult>(store: Store<TState, TEvent>, context: TContext) => TResult;

function thunkMiddlewareFactory<TState, TEvent, TContext>(
    context: TContext
): Middleware<TState, TEvent | Thunk<TState, TEvent, TContext>> {
    return ({ getState, subscribe }) => (event, next) => {
        const dispatch = (event: TEvent | Thunk<TState, TEvent, TContext>): any => {
            if (typeof event === 'function') {
                return event({ dispatch, getState, subscribe }, context);
            } else {
                return next(event);
            }
        };
        return dispatch(event);
    };
}

export default thunkMiddlewareFactory;
