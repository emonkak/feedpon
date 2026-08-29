import type { HookFunction, UpdateHandle } from 'barebind';

export type AsyncResource<T> =
  | {
      state: 'pending';
      value: undefined;
      reason: undefined;
    }
  | {
      state: 'fulfilled';
      value: T;
      reason: undefined;
    }
  | {
      state: 'rejected';
      value: undefined;
      reason: unknown;
    };

type AsyncResourceWithThunk<TValue, TRequest> = AsyncResource<TValue> & {
  thunk: Thunk<TRequest>;
};

interface Thunk<T> {
  request: T;
  abortController: AbortController;
  finishController: PromiseWithResolvers<UpdateHandle>;
}

export function AsyncResource<TValue, TRequest>(
  args: TRequest,
  fetch: (request: TRequest, signal: AbortSignal) => Promise<TValue>,
): HookFunction<
  [
    resource: AsyncResource<TValue>,
    refetch: (request: TRequest, signal: AbortSignal) => Promise<UpdateHandle>,
    isPending: boolean,
  ]
> {
  return (context) => {
    const [thunk, setThunk] = context.useState<Thunk<TRequest>>(() => {
      const finishController = Promise.withResolvers<UpdateHandle>();
      const abortController = new AbortController();
      return { request: args, finishController, abortController };
    });
    const [resource, setResource] = context.useState<
      AsyncResourceWithThunk<TValue, TRequest>
    >(() => ({
      state: 'pending',
      value: undefined,
      reason: undefined,
      thunk,
    }));

    context.useEffect(() => {
      const { request, finishController, abortController } = thunk;
      const { signal } = abortController;
      fetch(request, signal).then(
        (value) => {
          if (!signal.aborted) {
            finishController.resolve(
              setResource({
                state: 'fulfilled',
                value,
                reason: undefined,
                thunk,
              }),
            );
          }
        },
        (reason) => {
          if (!signal.aborted) {
            finishController.resolve(
              setResource({
                state: 'rejected',
                value: undefined,
                reason,
                thunk,
              }),
            );
          }
          return Promise.reject(reason);
        },
      );
      signal.addEventListener('abort', () => {
        finishController.reject(signal.reason);
      });
      return () => {
        abortController.abort();
      };
    }, [thunk]);

    const refetch = async (request: TRequest, signal: AbortSignal) => {
      const finishController = Promise.withResolvers<UpdateHandle>();
      const abortController = deriveAbortController(signal);
      await setThunk({ request, finishController, abortController }).finished;
      return await finishController.promise;
    };

    return [resource, refetch, resource.thunk !== thunk];
  };
}

function deriveAbortController(signal: AbortSignal): AbortController {
  const controller = new AbortController();
  signal.addEventListener('abort', () => {
    controller.abort(signal.reason);
  });
  return controller;
}
