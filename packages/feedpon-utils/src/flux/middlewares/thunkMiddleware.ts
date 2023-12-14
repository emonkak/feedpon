import { Middleware } from '../types';

function thunkMiddlewareFactory<TState, TEvent, TContext>(
  context: TContext,
): Middleware<TState, TEvent> {
  return ({ getState, replaceState, subscribe }) =>
    (event, next) => {
      const dispatch = (event: TEvent): any => {
        if (typeof event === 'function') {
          return (event as any)(
            { dispatch, getState, replaceState, subscribe },
            context,
          );
        } else {
          return next(event);
        }
      };
      return dispatch(event);
    };
}

export default thunkMiddlewareFactory;
