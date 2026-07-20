import type { Reactive } from 'barebind/addons/signal';
import { ImmutableMap } from '../ImmutableMap.ts';
import type { Action, AsyncMiddleware, Dispatch, Store } from '../Store.ts';

export interface Patch {
  path: readonly PropertyKey[];
  type?: string;
  value: unknown;
  version: number;
}

export interface PersistentState {
  version: number;
}

export interface PersistentStorage {
  addPatches(patches: Patch[]): Promise<void>;
  findPatches(): Promise<Patch[]>;
}

export class PersistentMiddleware<TState extends PersistentState, TContext>
  implements AsyncMiddleware<TState, TContext>
{
  private readonly _storage: PersistentStorage;
  private _pendingActions: number = 0;
  private _pendingPatches: Patch[] = [];

  constructor(storage: PersistentStorage) {
    this._storage = storage;
  }

  async connect(store: Store<TState, TContext>): Promise<() => void> {
    const patches = await this._storage.findPatches();
    for (const patch of patches) {
      applyPatch(store.state$, patch);
    }
    return store.state$.subscribe((event) => {
      this._pendingPatches.push(
        createPatch(event.path, event.newValue, store.state$.version),
      );
    });
  }

  handle<TResult>(
    action: Action<TState, TContext, TResult>,
    dispatch: Dispatch<TState, TContext>,
    _store: Store<TState, TContext>,
  ): TResult {
    const flushPatches = async () => {
      if (this._pendingActions > 0) {
        return;
      }
      if (this._pendingPatches.length > 0) {
        const wipPatches = this._pendingPatches.splice(0);
        try {
          await this._storage.addPatches(wipPatches);
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

function applyPatch<T extends PersistentState>(
  state$: Reactive<T>,
  patch: Patch,
): void {
  const { path, type, value, version } = patch;

  if (version !== state$.value.version) {
    return;
  }

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
