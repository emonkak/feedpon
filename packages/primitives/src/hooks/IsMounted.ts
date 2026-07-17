import type { HookFunction } from 'barebind';

export function IsMounted(): HookFunction<() => boolean> {
  return (context) => {
    const isMounted = context.useRef(false);

    context.useEffect(() => {
      isMounted.current = true;

      return () => {
        isMounted.current = false;
      };
    }, []);

    return context.useCallback(() => isMounted.current, []);
  };
}
