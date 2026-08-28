import { Derivable } from 'barebind/addons/signal';

export type Action<TState, TContext, TResult> = (
  state: Derivable<TState>,
  context: TContext,
  dispatch: Dispatch<TState, TContext>,
) => TResult;

export type Dispatch<TState, TContext> = <TResult>(
  action: Action<TState, TContext, TResult>,
) => TResult;

export type Plugin<TState, TContext> =
  | AsyncPlugin<TState, TContext>
  | SyncPlugin<TState, TContext>;

export interface AsyncPlugin<TState, TContext> {
  connect(store: Store<TState, TContext>): Promise<(() => void) | void> | void;
  handle<TResult>(
    action: Action<TState, TContext, TResult>,
    dispatch: Dispatch<TState, TContext>,
    store: Store<TState, TContext>,
  ): TResult;
}

export interface SyncPlugin<TState, TContext> {
  connect(store: Store<TState, TContext>): (() => void) | void;
  handle<TResult>(
    action: Action<TState, TContext, TResult>,
    dispatch: Dispatch<TState, TContext>,
    store: Store<TState, TContext>,
  ): TResult;
}

export class Store<TState, TContext> {
  private readonly _state$: Derivable<TState>;

  private readonly _context: TContext;

  private readonly _plugins: Plugin<TState, TContext>[] = [];

  constructor(initialState: TState, context: TContext) {
    this._state$ = Derivable.from(initialState);
    this._context = context;
  }

  get context(): TContext {
    return this._context;
  }

  get state$(): Derivable<TState> {
    return this._state$;
  }

  dispatch<TResult>(action: Action<TState, TContext, TResult>): TResult {
    const dispatch = <T>(action: Action<TState, TContext, T>): T =>
      action(this._state$, this._context, dispatch);
    const next = <TResult>(
      action: Action<TState, TContext, TResult>,
      index: number,
    ): TResult =>
      this._plugins[index]?.handle(
        action,
        (action) => next(action, index + 1),
        this,
      ) ?? dispatch(action);
    return next(action, 0);
  }

  use(plugin: AsyncPlugin<TState, TContext>): Promise<() => Promise<void>>;
  use(plugin: SyncPlugin<TState, TContext>): () => void;
  use(plugin: Plugin<TState, TContext>): Promise<() => void> | (() => void) {
    const promiseOrDisconnect = plugin.connect(this);
    const connect = (disconnect: (() => void) | void) => {
      this._plugins.push(plugin);
      return () => {
        const index = this._plugins.indexOf(plugin);
        if (index >= 0) {
          this._plugins.splice(index, 1);
        }
        disconnect?.();
      };
    };
    return promiseOrDisconnect instanceof Promise
      ? promiseOrDisconnect.then(connect)
      : connect(promiseOrDisconnect);
  }
}
