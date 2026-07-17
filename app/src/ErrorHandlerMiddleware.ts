import type { Dispatch, Middleware, Store } from '@feedpon/foundation';
import type { AppAction, AppContext, AppState } from '@feedpon/model';
import { sendNotification } from '@feedpon/model/actions/ui';

export class ErrorHandlerMiddleware
  implements Middleware<AppState, AppContext>
{
  handle<TResult>(
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
