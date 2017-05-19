import { Middleware } from '../types';

function asyncMiddlewareFactory<TState, TEvent>(context: any = {}): Middleware<TState, TEvent> {
    return function asyncMiddleware(event, next, { getState }) {
        const dispatch = (event: TEvent): any => {
            if (typeof event === 'function') {
                return event(dispatch, getState, context);
            } else {
                return next(event);
            }
        };
        return dispatch(event);
    };
}

export default asyncMiddlewareFactory;
