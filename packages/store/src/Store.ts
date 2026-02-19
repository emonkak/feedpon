import type { Reactive } from 'barebind/addons/reactive';

export type Action<TState, TContext, TResult> = (
  state: Reactive<TState>,
  context: TContext,
  dispatch: Dispatch<TState, TContext>,
) => TResult;

export type Dispatch<TState, TContext> = <TResult>(
  action: Action<TState, TContext, TResult>,
) => TResult;

export interface Middleware<TState, TContext> {
  connect?(store: Store<TState, TContext>): void;
  handle<TResult>(
    action: Action<TState, TContext, TResult>,
    dispatch: Dispatch<TState, TContext>,
    store: Store<TState, TContext>,
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

  get context(): TContext {
    return this._context;
  }

  get state$(): Reactive<TState> {
    return this._state$;
  }

  dispatch<TResult>(action: Action<TState, TContext, TResult>): TResult {
    let index = 0;
    const dispatch: Dispatch<TState, TContext> = (action) => {
      return this._middlewares.length > index
        ? this._middlewares[index++]!.handle(action, dispatch, this)
        : action(this._state$, this._context, dispatch);
    };
    return dispatch(action);
  }

  with(middleware: Middleware<TState, TContext>): this {
    middleware.connect?.(this);
    this._middlewares.push(middleware);
    return this;
  }
}
