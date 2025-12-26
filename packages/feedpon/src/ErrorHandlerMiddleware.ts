import type { Reactive } from 'barebind/addons/reactive';
import type { AppAction, AppContext, AppState } from 'feedpon-store';
import { sendNotification } from 'feedpon-store/actions/ui';
import type { Dispatcher, Middleware } from 'store';

export class ErrorHandlerMiddleware
  implements Middleware<AppState, AppContext>
{
  handleAction<TResult>(
    action: AppAction<TResult>,
    _state$: Reactive<AppState>,
    _context: AppContext,
    dispatch: Dispatcher<AppState, AppContext>,
  ): TResult {
    const result = dispatch(action);
    if (result instanceof Promise) {
      result.catch((error) => {
        const message =
          error instanceof Error ? error.message : JSON.stringify(error);
        dispatch(sendNotification('negative', message, -1));
        console.error(error);
      });
    }
    return result;
  }
}
