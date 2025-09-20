import {
  $customHook,
  type CustomHookObject,
  type RenderContext,
} from 'barebind';
import type { Difference, Reactive } from 'barebind/extras/reactive';

import type { AppAction, AppContext } from './action.ts';
import { sendNotification } from './actions/ui.ts';
import { ImmutableMap } from './collections/ImmutableMap.ts';
import type { Patch } from './persistent.ts';
import type { AppState, CommandHandler, CommandId } from './state.ts';
import { isPromiseLike } from './utils/isPromiseLike.ts';
import { requestPersistentCallback } from './utils/requestPersistentCallback.ts';

export class AppStore implements CustomHookObject<void> {
  private readonly _context: AppContext;

  static [$customHook](context: RenderContext): AppStore {
    const value = context.getSharedContext(AppStore);

    if (!(value instanceof AppStore)) {
      throw new Error('AppStore is not registered in this context.');
    }

    return value;
  }

  constructor(context: AppContext) {
    this._context = context;
  }

  [$customHook](context: RenderContext): void {
    context.setSharedContext(this.constructor, this);
  }

  get state$(): Reactive<AppState> {
    return this._context.state$;
  }

  dispatchAction<TResult>(action: AppAction<TResult>): TResult {
    const { persistentStore, state$ } = this._context;
    const { version } = state$.value;
    const savePendingDifferences = () => {
      const patches = state$
        .collectDifferences()
        .map((difference) => toPatch(difference, version));
      if (patches.length > 0) {
        persistentStore.addPatches(patches);
      }
    };
    const result = action(this._context);
    if (isPromiseLike(result)) {
      result.then(
        () => {
          requestPersistentCallback(savePendingDifferences);
        },
        (error) => {
          const message =
            error instanceof Error ? error.message : JSON.stringify(error);
          this.dispatchAction(sendNotification('error', message, -1));
        },
      );
    } else {
      requestPersistentCallback(savePendingDifferences);
    }
    return result;
  }

  async restoreState(): Promise<void> {
    const { persistentStore, state$ } = this._context;
    const { version } = state$.value;
    const patches = await persistentStore.findPatches();

    for (let i = 0, l = patches.length; i < l; i++) {
      const patch = patches[i]!;
      if (patch.version === version) {
        const difference = toDifference(patch);
        state$.applyDifference(difference);
      }
    }
  }

  invokeCommand<TCommandId extends CommandId>(
    commandId: TCommandId,
  ): ReturnType<CommandHandler<AppContext>[TCommandId]> {
    const { commandHandler } = this._context;

    return this.dispatchAction(commandHandler[commandId]) as ReturnType<
      CommandHandler<AppContext>[TCommandId]
    >;
  }
}

function toDifference(statePatch: Patch): Difference {
  switch (statePatch.type) {
    case 'ImmutableMap':
      return {
        path: statePatch.path,
        value: ImmutableMap.from(statePatch.value as [unknown, unknown][]),
      };
    default:
      return statePatch;
  }
}

function toPatch(difference: Difference, version: number): Patch {
  if (difference.value instanceof ImmutableMap) {
    return {
      path: difference.path,
      value: Array.from(difference.value),
      type: 'ImmutableMap',
      version,
    };
  } else {
    return {
      path: difference.path,
      value: difference.value,
      version,
    };
  }
}
