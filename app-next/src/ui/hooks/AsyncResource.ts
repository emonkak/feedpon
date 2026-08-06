import type { HookFunction } from 'barebind';

export interface AsyncResource<T> {
  content: T | null;
  loading: boolean;
}

export function AsyncResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  dependencies: unknown[],
): HookFunction<AsyncResource<T>> {
  return (context) => {
    const [resource, setResource] = context.useState<AsyncResource<T>>({
      content: null,
      loading: false,
    });
    context.useEffect(() => {
      const controller = new AbortController();
      fetcher(controller.signal).then(
        (content) => {
          setResource({ content, loading: false });
        },
        (error) => {
          setResource((resource) => ({
            content: resource.content,
            loading: false,
          }));
          return Promise.reject(error);
        },
      );
      setResource((resource) => ({ content: resource.content, loading: true }));
      return () => {
        controller.abort();
      };
    }, dependencies);
    return resource;
  };
}
