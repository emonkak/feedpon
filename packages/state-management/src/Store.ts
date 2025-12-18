import type { Reactive } from 'barebind/extras/reactive';

export type Action<TState, TContext, TResult> = (
  state: Reactive<TState>,
  context: TContext,
  dispatch: Dispatcher<TState, TContext>,
) => TResult;

export type Dispatcher<TState, TContext> = <TResult>(
  action: Action<TState, TContext, TResult>,
) => TResult;

export interface Middleware<TState, TContext> {
  handleAction<TResult>(
    action: Action<TState, TContext, TResult>,
    state$: Reactive<TState>,
    context: TContext,
    dispatch: Dispatcher<TState, TContext>,
  ): TResult;
}

export class Store<TState, TContext> {
  private readonly _state$: Reactive<TState>;

  private readonly _context: TContext;

  private readonly _middlewares: Middleware<TState, TContext>[] = [];

  constructor(state$: Reactive<TState>, context: TContext) {
    this._state$ = state$;
    this._context = context;
  }

  get state$(): Reactive<TState> {
    return this._state$;
  }

  dispatchAction<TResult>(action: Action<TState, TContext, TResult>): TResult {
    let index = 0;
    const dispatch: Dispatcher<TState, TContext> = (action) => {
      return this._middlewares.length > index
        ? this._middlewares[index++]!.handleAction(
            action,
            this._state$,
            this._context,
            dispatch,
          )
        : action(this._state$, this._context, dispatch);
    };
    return dispatch(action);
  }

  with(middleware: Middleware<TState, TContext>): this {
    this._middlewares.push(middleware);
    return this;
  }
}
