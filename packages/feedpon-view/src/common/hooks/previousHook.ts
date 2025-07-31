import type { CustomHookFunction } from 'barebind';

export function createPreviousHook<T>(value: T): CustomHookFunction<T | null> {
  return (context) => {
    const ref = context.useRef<T | null>(null);
    const previous = ref.current;

    ref.current = value;

    return previous;
  };
}
