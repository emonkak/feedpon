import type { RenderContext, Usable } from '@emonkak/ebit';

export function createPreviousHook<T>(value: T): Usable<T | null> {
  return (context: RenderContext) => {
    const ref = context.useRef<T | null>(null);
    const previous = ref.current;

    ref.current = value;

    return previous;
  };
}
