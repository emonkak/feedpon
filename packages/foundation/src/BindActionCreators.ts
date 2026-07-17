import type { HookFunction, HookObject } from 'barebind';

import type { Action, Store } from './Store.ts';

type ActionFactories<TState, TContext> = Record<
  string,
  (...args: any[]) => Action<TState, TContext, any>
>;

type BoundActionCreators<
  TState,
  TContext,
  TActionFactories extends ActionFactories<TState, TContext>,
> = {
  [K in keyof TActionFactories]: (
    ...args: Parameters<TActionFactories[K]>
  ) => ReturnType<ReturnType<TActionFactories[K]>>;
};

export function BindActionCreators<
  TState,
  TContext,
  const TActionFactories extends ActionFactories<TState, TContext>,
>(
  storeClass: HookObject<Store<TState, TContext>>,
  actionFactories: TActionFactories,
): HookFunction<BoundActionCreators<TState, TContext, TActionFactories>> {
  return (context) => {
    const store = context.use(storeClass);

    return context.useMemo(() => {
      const boundActionFactories = {} as BoundActionCreators<
        TState,
        TContext,
        TActionFactories
      >;

      for (const key of Object.keys(
        actionFactories,
      ) as (keyof TActionFactories)[]) {
        const actionFactory = actionFactories[key]!;

        boundActionFactories[key] = (...args: any[]) =>
          store.dispatch(actionFactory(...args));
      }

      return boundActionFactories;
    }, [actionFactories, store]);
  };
}
