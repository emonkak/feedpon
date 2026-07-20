import type { Reactive } from 'barebind/addons/signal';
import { LinkedList } from './LinkedList.ts';

export type Action<TState, TContext, TResult> = (
  state: Reactive<TState>,
  context: TContext,
  dispatch: Dispatch<TState, TContext>,
) => TResult;

export type Dispatch<TState, TContext> = <TResult>(
  action: Action<TState, TContext, TResult>,
) => TResult;

export type Middleware<TState, TContext> =
  | AsyncMiddleware<TState, TContext>
  | SyncMiddleware<TState, TContext>;

export interface AsyncMiddleware<TState, TContext> {
  connect(store: Store<TState, TContext>): Promise<(() => void) | void> | void;
  handle<TResult>(
    action: Action<TState, TContext, TResult>,
    dispatch: Dispatch<TState, TContext>,
    store: Store<TState, TContext>,
  ): TResult;
}

export interface SyncMiddleware<TState, TContext> {
  connect(store: Store<TState, TContext>): (() => void) | void;
  handle<TResult>(
    action: Action<TState, TContext, TResult>,
    dispatch: Dispatch<TState, TContext>,
    store: Store<TState, TContext>,
  ): TResult;
}

export class Store<TState, TContext> {
  private readonly _state$: Reactive<TState>;

  private readonly _context: TContext;

  private readonly _middlewares: LinkedList<Middleware<TState, TContext>> =
    new LinkedList();

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
    const next = <TResult>(
      action: Action<TState, TContext, TResult>,
      node: LinkedList.Node<Middleware<TState, TContext>> | null,
    ): TResult => {
      return node !== null
        ? node.value.handle(action, (action) => next(action, node.next), this)
        : action(this._state$, this._context, this.dispatch.bind(this));
    };
    return next(action, this._middlewares.front());
  }

  use(middleware: SyncMiddleware<TState, TContext>): () => void;
  use(
    middleware: AsyncMiddleware<TState, TContext>,
  ): Promise<() => Promise<void>>;
  use(
    middleware: Middleware<TState, TContext>,
  ): Promise<() => void> | (() => void) {
    const disconnect = middleware.connect(this);
    const register = (disconnect: (() => void) | void) => {
      const node = this._middlewares.pushBack(middleware);
      return () => {
        this._middlewares.remove(node);
        disconnect?.();
      };
    };
    return disconnect instanceof Promise
      ? disconnect.then(register)
      : register(disconnect);
  }
}
