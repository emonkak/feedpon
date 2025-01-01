import type { Middleware } from '../index';

export function loggerMiddleware<
  TState,
  TEvent extends { type: string },
>(): Middleware<TState, TEvent> {
  return ({ getState }) => {
    return (event, next) => {
      const start = performance.now();
      const startDate = new Date(performance.timeOrigin + start);
      const prevState = getState();
      const result = next(event);
      const end = performance.now();
      console.groupCollapsed(
        '%caction %c%s %c@ %s:%s:%s.%s (in %s ms)',
        'color: gray; font-weight: lighter',
        'color: inherit',
        event.type,
        'color: gray; font-weight: lighter',
        startDate.getHours().toString().padStart(2, '0'),
        startDate.getMinutes().toString().padStart(2, '0'),
        startDate.getSeconds().toString().padStart(2, '0'),
        (startDate.getMilliseconds() % 1000).toString().padStart(3, '0'),
        (end - start).toFixed(2),
      );
      console.log(
        '%cprev state',
        'color: #9E9E9E; font-weight: bold',
        prevState,
      );
      console.log('%caction', 'color: #03A9F4; font-weight: bold', event);
      console.log(
        '%cnext state',
        'color: #4CAF50; font-weight: bold',
        getState(),
      );
      console.groupEnd();
      return result;
    };
  };
}
