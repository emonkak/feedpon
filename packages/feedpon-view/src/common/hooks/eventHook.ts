import type { Usable } from '@emonkak/ebit';

// Based on this implementation:
// https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
export function createEventHook<THandler extends (...args: any[]) => any>(
  handler: THandler,
): Usable<(...args: Parameters<THandler>) => ReturnType<THandler>> {
  return (context) => {
    const handlerRef = context.useRef<THandler>(handler);

    context.useLayoutEffect(() => {
      handlerRef.current = handler;
    });

    return context.useCallback(function (
      this: ThisType<THandler>,
      ...args: Parameters<THandler>
    ): ReturnType<THandler> {
      const handler = handlerRef.current!;
      return handler?.apply(this, args);
    }, []);
  };
}
