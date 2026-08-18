import type { HookFunction } from 'barebind';

type PromiseState = 'pending' | 'fulfilled' | 'rejected';

export interface AsyncResource<T> {
  state: PromiseState;
  value: T | undefined;
  reason: unknown;
}

export function AsyncResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  dependencies: unknown[],
): HookFunction<AsyncResource<T>> {
  return (context) => {
    const prefetch = context.useMemo(() => {
      const controller = new AbortController();
      const promise = fetcher(controller.signal);
      promise.then(
        () => {
          prefetch.state = 'fulfilled';
        },
        () => {
          prefetch.state = 'rejected';
        },
      );
      return { state: 'pending' as PromiseState, controller, promise };
    }, dependencies);
    const [value, setValue] = context.useState<T | undefined>(undefined);
    const [reason, setReason] = context.useState<unknown>(undefined);

    context.useEffect(() => {
      prefetch.promise.then(
        (value) => {
          setValue(() => value);
          setReason(undefined);
        },
        (reason) => {
          setValue(undefined);
          setReason(() => reason);
        },
      );
      return () => {
        prefetch.controller.abort();
      };
    }, [prefetch]);

    return { state: prefetch.state, value, reason };
  };
}

export function mapAsyncResource<T, U>(
  resource: AsyncResource<T>,
  selector: (value: T) => U,
): AsyncResource<U> {
  return {
    state: resource.state,
    value: resource.value !== undefined ? selector(resource.value) : undefined,
    reason: resource.reason,
  };
}
