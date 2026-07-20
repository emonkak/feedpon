import type { Reactive } from 'barebind/addons/signal';
import { ImmutableMap } from '../ImmutableMap.ts';
import type { Action, Dispatch, Middleware, Store } from '../Store.ts';

export interface Patch {
  path: readonly PropertyKey[];
  type?: string;
  value: unknown;
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

  private _pendingPatches: Patch[] = [];

  connect(store: Store<TState, TContext>): () => void {
    const { version } = store.state$.value;

    return store.state$.subscribe((event) => {
      this._pendingPatches.push(
        createPatch(event.path, event.newValue, version),
      );
    });
  }

  handle<TResult>(
    action: Action<TState, TContext, TResult>,
    dispatch: Dispatch<TState, TContext>,
    store: Store<TState, TContext>,
  ): TResult {
    const { stateRepository } = store.context;
    const flushPatches = async () => {
      if (this._pendingActions > 0) {
        return;
      }
      if (this._pendingPatches.length > 0) {
        const wipPatches = this._pendingPatches.splice(0);
        try {
          await stateRepository.addPatches(wipPatches);
        } catch {
          this._pendingPatches.push(...wipPatches);
        }
      }
    };
    this._pendingActions++;
    try {
      const result = dispatch(action);
      if (result instanceof Promise) {
        result.then(
          () => {
            if (--this._pendingActions === 0) {
              requestPersistentCallback(flushPatches);
            }
          },
          () => {
            this._pendingActions--;
          },
        );
      } else {
        if (--this._pendingActions === 0) {
          requestPersistentCallback(flushPatches);
        }
      }
      return result;
    } catch (error) {
      this._pendingActions--;
      throw error;
    }
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
        applyPatch(state$, patch);
      }
    }
  };
}

function applyPatch<T>(state$: Reactive<T>, patch: Patch): void {
  const { path, type, value } = patch;

  let target$: Reactive<unknown> | undefined = state$ as Reactive<unknown>;

  for (let i = 0, l = path.length; i < l; i++) {
    target$ = target$.get(path[i]!);
    if (target$ === undefined) {
      return;
    }
  }

  switch (type) {
    case 'ImmutableMap':
      target$.value = (value as [unknown, unknown][]).reduce(
        (entries, entry) => entries.set(entry[0], entry[1]),
        ImmutableMap.empty(),
      );
      break;
    default:
      target$.value = value;
  }
}

function createPatch(
  path: readonly PropertyKey[],
  value: unknown,
  version: number,
): Patch {
  if (value instanceof ImmutableMap) {
    return {
      path,
      value: Array.from(value.entries()),
      type: 'ImmutableMap',
      version,
    };
  } else {
    return {
      path,
      value,
      version,
    };
  }
}

function requestPersistentCallback(callback: () => void): void {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 100);
  }
}
