import type { HookFunction } from 'barebind';

export const isMountedHook: HookFunction<() => boolean> = (context) => {
  const isMounted = context.useRef(false);

  context.useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return context.useCallback(() => isMounted.current, []);
};
