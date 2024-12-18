type Binder = <TBoundArgs extends any[], TUnboundArgs extends any[], TResult>(
  f: (...args: [...TBoundArgs, ...TUnboundArgs]) => TResult,
  ...args: TBoundArgs
) => (...args: TUnboundArgs) => TResult;

export function createBinder(): Binder {
  const cache = new WeakMap<Function, Map<unknown, Function>>();

  return function bind<
    TBoundArgs extends any[],
    TUnboundArgs extends any[],
    TResult,
  >(
    f: (...args: [...TBoundArgs, ...TUnboundArgs]) => TResult,
    ...args: TBoundArgs
  ): (...args: TUnboundArgs) => TResult {
    let g: (...args: any[]) => TResult = f;
    for (let i = 0, l = args.length; i < l; i++) {
      g = bindInCache(cache, g, args[i]);
    }
    return g;
  };
}

function bindInCache<TBoundArg, TUnboundArgs extends any[], TResult>(
  cache: WeakMap<Function, Map<unknown, Function>>,
  f: (boundArg: TBoundArg, ...unboundArgs: TUnboundArgs) => TResult,
  boundArg: TBoundArg,
): (...unboundArgs: TUnboundArgs) => TResult {
  let boundFunctions = cache.get(f);

  if (boundFunctions === undefined) {
    boundFunctions = new Map();
    cache.set(f, boundFunctions);
  }

  let boundFunction = boundFunctions.get(boundArg) as (
    ...unboundArgs: TUnboundArgs
  ) => TResult;

  if (boundFunction === undefined) {
    boundFunction = (...unboundArgs: TUnboundArgs) =>
      f(boundArg, ...unboundArgs);
    boundFunctions.set(boundArg, boundFunction);
  }

  return boundFunction;
}
