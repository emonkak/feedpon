import type * as Redux from 'redux';
import type { Middleware } from '../index';

function reduxMiddlewareFactory<TState, TEvent>(
  middleware: Redux.Middleware<{}, TState>,
): Middleware<TState, TEvent> {
  return (store) => {
    const handler = middleware(store as any);
    return (event, next) => handler(next as any)(event as any);
  };
}

export default reduxMiddlewareFactory;
