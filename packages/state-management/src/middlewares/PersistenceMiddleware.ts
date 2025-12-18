import type { Difference, Reactive } from 'barebind/extras/reactive';

import { ImmutableMap } from '../collections/ImmutableMap.ts';
import type { Action, Dispatcher, Middleware } from '../Store.ts';

export interface Patch extends Difference {
  type?: string;
  version: number;
}

export interface PatchRepository {
  addPatches(patches: Patch[]): Promise<void>;
  findPatches(): Promise<Patch[]>;
}

export interface PersistentContext {
  stateRepository: PatchRepository;
}

export interface PersistentState {
  version: number;
}

export class PersistentMiddleware<
  TState extends PersistentState,
  TContext extends PersistentContext,
> implements Middleware<TState, TContext>
{
  private _pendingActions: number = 0;

  handleAction<TResult>(
    action: Action<TState, TContext, TResult>,
    state$: Reactive<TState>,
    context: TContext,
    dispatch: Dispatcher<TState, TContext>,
  ): TResult {
    const { version } = state$.value;
    const { stateRepository } = context;
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
    const result = dispatch(action);
    if (result instanceof Promise) {
      result.then(
        () => {
          requestPersistentCallback(flushPendingDifferences);
          this._pendingActions--;
        },
        () => {
          this._pendingActions--;
        },
      );
      this._pendingActions++;
    } else {
      requestPersistentCallback(flushPendingDifferences);
    }
    return result;
  }
}

export function restoreState<
  TState extends PersistentState,
  TContext extends PersistentContext,
>(): Action<TState, TContext, Promise<void>> {
  return async (state$, context) => {
    const { stateRepository } = context;
    const { version } = state$.value;
    const patches = await stateRepository.findPatches();

    for (let i = 0, l = patches.length; i < l; i++) {
      const patch = patches[i]!;
      if (patch.version === version) {
        const difference = toDifference(patch);
        state$.applyDifference(difference);
      }
    }
  };
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
