import type { Derivable } from 'barebind/addons/signal';
import { LinkedList } from './LinkedList.ts';

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

  private readonly _plugins: LinkedList<Plugin<TState, TContext>> =
    new LinkedList();

  constructor(state$: Derivable<TState>, context: TContext) {
    this._state$ = state$;
    this._context = context;
  }

  get context(): TContext {
    return this._context;
  }

  get state$(): Derivable<TState> {
    return this._state$;
  }

  dispatch<TResult>(action: Action<TState, TContext, TResult>): TResult {
    const next = <TResult>(
      action: Action<TState, TContext, TResult>,
      node: LinkedList.Node<Plugin<TState, TContext>> | null,
    ): TResult => {
      return node !== null
        ? node.value.handle(action, (action) => next(action, node.next), this)
        : action(this._state$, this._context, this.dispatch.bind(this));
    };
    return next(action, this._plugins.front());
  }

  use(plugin: SyncPlugin<TState, TContext>): () => void;
  use(plugin: AsyncPlugin<TState, TContext>): Promise<() => Promise<void>>;
  use(plugin: Plugin<TState, TContext>): Promise<() => void> | (() => void) {
    const disconnect = plugin.connect(this);
    const register = (disconnect: (() => void) | void) => {
      const node = this._plugins.pushBack(plugin);
      return () => {
        this._plugins.remove(node);
        disconnect?.();
      };
    };
    return disconnect instanceof Promise
      ? disconnect.then(register)
      : register(disconnect);
  }
}
