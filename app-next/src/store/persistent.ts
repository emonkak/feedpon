import type { Derivable, InvalidateEvent } from 'barebind/addons/signal';
import type { ObjectStoreManager } from '../database/types.ts';
import type { Action, AsyncPlugin, Dispatch, Store } from './store.ts';

const enum PatchKind {
  SET = 0,
  DELETE = 1,
}

export interface Patch {
  path: PropertyKey[];
  kind: PatchKind;
  type: string | null;
  value: unknown;
  version: number;
}

export interface PatchStore {
  add(patche: Patch): Promise<void>;
  getAll(): Promise<Patch[]>;
  invalidatePath(path: PropertyKey[]): Promise<void>;
}

export type PatchTransactionManager = ObjectStoreManager<{
  patches: { new (...args: any[]): PatchStore };
}>;

export class PersistentPlugin<TState, TContext>
  implements AsyncPlugin<TState, TContext>
{
  private readonly _transactionManager: PatchTransactionManager;
  private readonly _version: number;
  private _pendingActions: number = 0;
  private _pendingPatches: Patch[] = [];

  constructor(transactionManager: PatchTransactionManager, version: number) {
    this._transactionManager = transactionManager;
    this._version = version;
  }

  async connect(store: Store<TState, TContext>): Promise<() => void> {
    const patches = await this._transactionManager.runTransaction(
      ['patches'],
      ({ patches }) => patches.getAll(),
    );
    for (const patch of patches) {
      if (patch.version === this._version) {
        applyPatch(store.state$, patch);
      }
    }
    return store.state$.subscribe((event) => {
      this._pendingPatches.push(createPatch(event, this._version));
      this._requestFlush();
    });
  }

  handle<TResult>(
    action: Action<TState, TContext, TResult>,
    dispatch: Dispatch<TState, TContext>,
    _store: Store<TState, TContext>,
  ): TResult {
    this._pendingActions++;
    try {
      const result = dispatch(action);
      if (result instanceof Promise) {
        result.then(
          () => {
            this._pendingActions--;
            this._requestFlush();
          },
          () => {
            this._pendingActions--;
          },
        );
      } else {
        this._pendingActions--;
        this._requestFlush();
      }
      return result;
    } catch (error) {
      this._pendingActions--;
      throw error;
    }
  }

  private _requestFlush(): void {
    if (this._pendingActions > 0 || this._pendingPatches.length === 0) {
      return;
    }
    scheduleFlush(() => {
      if (this._pendingActions > 0 || this._pendingPatches.length === 0) {
        return;
      }
      this._transactionManager.runTransaction(
        ['patches'],
        async ({ patches }) => {
          for (const patch of this._pendingPatches.splice(0)) {
            await patches.invalidatePath(patch.path);
            await patches.add(patch);
          }
        },
        {
          mode: 'readwrite',
        },
      );
    });
  }
}

function applyPatch<T>(state$: Derivable<T>, patch: Patch): void {
  switch (patch.kind) {
    case PatchKind.SET: {
      const target$ = lookupProperty(state$, patch.path);
      if (target$ !== undefined) {
        target$.value = patch.value;
      }
      break;
    }
    case PatchKind.DELETE: {
      const target$ = lookupProperty(state$, patch.path.slice(0, -1));
      if (target$ !== undefined) {
        delete (target$.value as any)[patch.path.at(-1)!];
      }
      break;
    }
  }
}

function createPatch(event: InvalidateEvent, version: number): Patch {
  switch (event.type) {
    case 'set':
      return {
        path: event.path,
        kind: PatchKind.SET,
        type: null,
        value: event.newValue,
        version,
      };
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

function lookupProperty(
  state$: Derivable<any>,
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

function scheduleFlush(callback: () => void): void {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 100);
  }
}
