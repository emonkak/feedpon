export class MemoBinder {
  private _cache = new WeakMap<Function, Map<unknown, Function>>();

  bind<TBoundArgs extends any[], TUnboundArgs extends any[], TResult>(
    f: (...args: [...TBoundArgs, ...TUnboundArgs]) => TResult,
    ...args: TBoundArgs
  ): (...args: TUnboundArgs) => TResult {
    let g: (...args: any[]) => TResult = f;
    for (let i = 0, l = args.length; i < l; i++) {
      g = bindWithCache(g, args[i], this._cache);
    }
    return g;
  }
}

function bindWithCache<TBoundArg, TUnboundArgs extends any[], TResult>(
  f: (boundArg: TBoundArg, ...unboundArgs: TUnboundArgs) => TResult,
  boundArg: TBoundArg,
  cache: WeakMap<Function, Map<unknown, Function>>,
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
