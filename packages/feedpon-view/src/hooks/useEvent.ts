import { useCallback, useLayoutEffect, useRef } from 'react';

// See: https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
export default function useEvent<THandler extends (...args: any) => any>(
  handler: THandler,
) {
  let handlerRef = useRef<THandler>(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: Parameters<THandler>) => {
    const handlerFn = handlerRef.current!;
    return handlerFn.apply(null, args);
  }, []);
}
