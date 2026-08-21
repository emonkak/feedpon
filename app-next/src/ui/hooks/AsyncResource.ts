import type { HookFunction, UpdateHandle } from 'barebind';

type PromiseState = 'pending' | 'fulfilled' | 'rejected';

export interface AsyncResource<T> {
  state: PromiseState;
  value: T;
  reason: unknown;
}

export interface AsyncResourceContext {
  reload: boolean;
  signal: AbortSignal;
}

export function AsyncResource<
  TValue,
  const TArgs extends readonly any[],
  const TDefault = undefined,
>(
  fetcher: (
    ...args: [...TArgs, context: AsyncResourceContext]
  ) => Promise<TValue>,
  args: TArgs,
  defaultValue?: TDefault,
): HookFunction<
  [resource: AsyncResource<TValue | TDefault>, reload: () => UpdateHandle]
> {
  return (context) => {
    const prefetch = context.useMemo(() => {
      const controller = new AbortController();
      const promise = fetcher(...args, {
        reload: false,
        signal: controller.signal,
      });
      promise.then(
        () => {
          prefetch.state = 'fulfilled';
        },
        () => {
          prefetch.state = 'rejected';
        },
      );
      return { controller, promise, state: 'pending' as PromiseState };
    }, args);
    const [value, setValue] = context.useState<TValue | TDefault>(
      () => defaultValue!,
    );
    const [reason, setReason] = context.useState<unknown>(undefined);
    const { promise, controller } = prefetch;

    context.useEffect(() => {
      promise.then(
        (value) => {
          if (!controller.signal.aborted) {
            setValue(() => value);
            setReason(undefined);
          }
        },
        (reason) => {
          if (!controller.signal.aborted) {
            setValue(() => defaultValue!);
            setReason(() => reason);
          }
        },
      );
      return () => {
        controller.abort();
      };
    }, [promise, controller]);

    const resource: AsyncResource<TValue | TDefault> = {
      state: prefetch.state,
      value,
      reason,
    };
    const reload = () => {
      const controller = new AbortController();
      const promise = fetcher(...args, {
        reload: true,
        signal: controller.signal,
      });
      promise.then(
        () => {
          prefetch.state = 'fulfilled';
        },
        () => {
          prefetch.state = 'rejected';
        },
      );
      prefetch.controller = controller;
      prefetch.promise = promise;
      prefetch.state = 'pending';
      return context.forceUpdate();
    };

    return [resource, reload];
  };
}
