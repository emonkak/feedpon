import type { Usable } from '@emonkak/ebit';

export const isMountedHook: Usable<() => boolean> = (context) => {
  const isMounted = context.useRef(false);

  context.useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return context.useCallback(() => isMounted.current, []);
};
