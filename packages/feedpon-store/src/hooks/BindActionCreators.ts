import type { CustomHookFunction } from 'barebind';

import type { AppAction } from '../action.ts';
import { AppStore } from '../store.ts';

type ActionFactories = Record<string, (...args: any[]) => AppAction<any>>;

type BoundActionCreators<TActionFactories extends ActionFactories> = {
  [K in keyof TActionFactories]: (
    ...args: Parameters<TActionFactories[K]>
  ) => ReturnType<ReturnType<TActionFactories[K]>>;
};

export function BindActionCreators<
  const TActionFactories extends ActionFactories,
>(
  actionFactories: TActionFactories,
): CustomHookFunction<BoundActionCreators<TActionFactories>> {
  return (context) => {
    const store = context.use(AppStore);

    return context.useMemo(() => {
      const boundActionFactories = {} as BoundActionCreators<TActionFactories>;

      for (const key of Object.keys(
        actionFactories,
      ) as (keyof TActionFactories)[]) {
        const actionFactory = actionFactories[key]!;

        boundActionFactories[key] = (...args: any[]) =>
          store.dispatchAction(actionFactory(...args));
      }

      return boundActionFactories;
    }, [actionFactories, store]);
  };
}
