export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return typeof (value as Promise<unknown>)?.then === 'function';
}
