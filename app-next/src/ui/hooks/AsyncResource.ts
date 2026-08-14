import type { HookFunction } from 'barebind';
import { Suspend, type SuspendStatus } from '../../foundation/suspend.ts';

export interface AsyncResource<T> {
  status: SuspendStatus;
  value: T | undefined;
  reason: unknown;
}

export function AsyncResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  dependencies: unknown[],
): HookFunction<AsyncResource<T>> {
  return (context) => {
    const [value, setValue] = context.useState<T | undefined>(undefined);
    const [reason, setReason] = context.useState<unknown>(undefined);
    const { suspend, controller } = context.useMemo(() => {
      const controller = new AbortController();
      const promise = fetcher(controller.signal);
      const suspend = Suspend.await(promise);
      return { suspend, controller };
    }, dependencies);

    context.useEffect(() => {
      suspend.then(
        (value) => {
          setValue(() => value);
          setReason(undefined);
        },
        (reason) => {
          setReason(() => reason);
        },
      );
      return () => {
        controller.abort();
      };
    }, [suspend]);

    return { status: suspend.status, value, reason };
  };
}

export function mapAsyncResource<T, U>(
  resource: AsyncResource<T>,
  selector: (value: T) => U,
): AsyncResource<U> {
  return {
    status: resource.status,
    value: resource.value !== undefined ? selector(resource.value) : undefined,
    reason: resource.reason,
  };
}
