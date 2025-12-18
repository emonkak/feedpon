import {
  $customHook,
  type CustomHookObject,
  type RenderContext,
} from 'barebind';
import type { Difference, Reactive } from 'barebind/extras/reactive';
import { ImmutableMap } from 'data-structures';

import type { AppAction, AppContext } from './action.ts';
import { sendNotification } from './actions/ui.ts';
import type { Patch } from './persistent.ts';
import type { AppState } from './state.ts';
import { isPromiseLike } from './utils/isPromiseLike.ts';

export class AppStore implements CustomHookObject<void> {
  private readonly _context: AppContext;

  private _pendingActions: number = 0;

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
    const { stateRepository, state$ } = this._context;
    const { version } = state$.value;
    const flushPendingDifferences = () => {
      if (this._pendingActions > 0) {
        return;
      }
      const patches = state$
        .collectDifferences()
        .map((difference) => toPatch(difference, version));
      if (patches.length > 0) {
        stateRepository.addPatches(patches);
      }
    };
    const result = action(this._context);
    if (isPromiseLike(result)) {
      result.then(
        () => {
          requestPersistentCallback(flushPendingDifferences);
          this._pendingActions--;
        },
        (error) => {
          const message =
            error instanceof Error ? error.message : JSON.stringify(error);
          console.error(error);
          this.dispatchAction(sendNotification('negative', message, -1));
          this._pendingActions--;
        },
      );
      this._pendingActions++;
    } else {
      requestPersistentCallback(flushPendingDifferences);
    }
    return result;
  }

  async restoreState(): Promise<void> {
    const { stateRepository, state$ } = this._context;
    const { version } = state$.value;
    const patches = await stateRepository.findPatches();

    for (let i = 0, l = patches.length; i < l; i++) {
      const patch = patches[i]!;
      if (patch.version === version) {
        const difference = toDifference(patch);
        state$.applyDifference(difference);
      }
    }
  }
}

function requestPersistentCallback(callback: () => void): void {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 10);
  }
}

function toDifference(statePatch: Patch): Difference {
  switch (statePatch.type) {
    case 'ImmutableMap':
      return {
        path: statePatch.path,
        value: (statePatch.value as [unknown, unknown][]).reduce(
          (entries, entry) => entries.set(entry[0], entry[1]),
          ImmutableMap.empty(),
        ),
      };
    default:
      return statePatch;
  }
}

function toPatch(difference: Difference, version: number): Patch {
  if (difference.value instanceof ImmutableMap) {
    return {
      path: difference.path,
      value: Array.from(difference.value.entries()),
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
