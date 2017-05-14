import { Middleware } from '../types';

const asyncMiddleware: Middleware<any, any> = (event, next, { getState }) => {
    if (typeof event === 'function') {
        event(next, getState);
    } else {
        next(event);
    }
};

export default asyncMiddleware;
