import type { AppAction, AppContext, AppState } from 'feedpon-store';
import { sendNotification } from 'feedpon-store/actions/ui';
import type { Dispatch, Middleware, Store } from 'store';

export class ErrorHandlerMiddleware
  implements Middleware<AppState, AppContext>
{
  handleAction<TResult>(
    action: AppAction<TResult>,
    dispatch: Dispatch<AppState, AppContext>,
    _store: Store<AppState, AppContext>,
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
