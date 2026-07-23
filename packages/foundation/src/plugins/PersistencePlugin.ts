import type { Derivable, InvalidateEvent } from 'barebind/addons/signal';
import { ImmutableMap } from '../ImmutableMap.ts';
import type { Action, AsyncPlugin, Dispatch, Store } from '../Store.ts';

export interface Patch {
  path: PropertyKey[];
  kind: PatchKind;
  type: string | null;
  value: unknown;
  version: number;
}

export interface PersistentStorage {
  addPatches(patches: Patch[]): Promise<void>;
  findPatches(): Promise<Patch[]>;
}

const enum PatchKind {
  SET = 0,
  DELETE = 1,
}

export class PersistentPlugin<TState, TContext>
  implements AsyncPlugin<TState, TContext>
{
  private readonly _storage: PersistentStorage;
  private readonly _version: number;
  private _pendingActions: number = 0;
  private _pendingPatches: Patch[] = [];

  constructor(storage: PersistentStorage, version: number) {
    this._storage = storage;
    this._version = version;
  }

  async connect(store: Store<TState, TContext>): Promise<() => void> {
    const patches = await this._storage.findPatches();
    for (const patch of patches) {
      if (patch.version === this._version) {
        applyPatch(store.state$, patch);
      }
    }
    return store.state$.subscribe((event) => {
      this._pendingPatches.push(createPatch(event, this._version));
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
        await this._storage.addPatches(wipPatches);
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

function applyPatch<T>(state$: Derivable<T>, patch: Patch): void {
  switch (patch.kind) {
    case PatchKind.SET: {
      const target$ = lookupProperty(state$ as Derivable<unknown>, patch.path);
      if (target$ !== undefined) {
        switch (patch.type) {
          case 'ImmutableMap':
            target$.value = (patch.value as [unknown, unknown][]).reduce(
              (entries, entry) => entries.set(entry[0], entry[1]),
              ImmutableMap.empty(),
            );
            break;
          default:
            target$.value = patch.value;
            break;
        }
      }
      break;
    }
    case PatchKind.DELETE: {
      const target$ = lookupProperty(
        state$ as Derivable<unknown>,
        patch.path.slice(0, -1),
      );
      if (target$ !== undefined) {
        delete (target$.value as any)[patch.path.at(-1)!];
      }
      break;
    }
  }
}

function lookupProperty(
  state$: Derivable<unknown>,
  path: PropertyKey[],
): Derivable<unknown> | undefined {
  let target$: Derivable<unknown> | undefined = state$;
  for (let i = 0, l = path.length; i < l; i++) {
    target$ = target$.get(path[i]!);
    if (target$ === undefined) {
      break;
    }
  }
  return target$;
}

function createPatch(event: InvalidateEvent, version: number): Patch {
  switch (event.type) {
    case 'set':
      if (event.newValue instanceof ImmutableMap) {
        return {
          path: event.path,
          kind: PatchKind.SET,
          type: 'ImmutableMap',
          value: Array.from(event.newValue.entries()),
          version,
        };
      } else {
        return {
          path: event.path,
          kind: PatchKind.SET,
          type: null,
          value: event.newValue,
          version,
        };
      }
    case 'delete':
      return {
        path: event.path,
        kind: PatchKind.DELETE,
        type: null,
        value: undefined,
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
