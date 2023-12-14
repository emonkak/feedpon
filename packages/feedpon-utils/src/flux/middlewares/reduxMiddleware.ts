import { Middleware } from '../types';

export interface ReduxAction {
  type: any;
}

interface ReduxDispatch {
  <TAction extends ReduxAction>(action: TAction): TAction;
}

export interface ReduxMiddlewareAPI<TState> {
  dispatch: ReduxDispatch;
  getState(): TState;
}

interface ReduxMiddleware {
  <TState>(api: ReduxMiddlewareAPI<TState>): (
    next: ReduxDispatch,
  ) => ReduxDispatch;
}

function reduxMiddlewareFactory<TState, TEvent extends ReduxAction>(
  middleware: ReduxMiddleware,
): Middleware<TState, TEvent> {
  return (store) => {
    const handler = middleware(store as any);

    return (event, next) => handler(next as any)(event as any);
  };
}

export default reduxMiddlewareFactory;
