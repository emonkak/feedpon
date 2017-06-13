import { Middleware } from '../types';

function asyncMiddlewareFactory<TState, TEvent>(context: any = {}): Middleware<TState, TEvent> {
    return ({ getState }) => (event, next) => {
        const dispatch = (event: TEvent) => {
            if (typeof event === 'function') {
                return event({ dispatch, getState }, context);
            } else {
                return next(event);
            }
        };
        return dispatch(event);
    };
}

export default asyncMiddlewareFactory;
