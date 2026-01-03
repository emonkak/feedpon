import type { HookFunction } from 'barebind';

export function createPreviousHook<T>(value: T): HookFunction<T | null> {
  return (context) => {
    const ref = context.useRef<T | null>(null);
    const previous = ref.current;

    ref.current = value;

    return previous;
  };
}
