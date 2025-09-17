import type { Stream } from '../states/stream.ts';
import type { Feed } from '../states/subscription.ts';
import type { Patch, PersistentStore } from './types.ts';

const DB_NAME = 'feedpon';
const DB_VERSION = 1;

const FEEDS_STORE = 'feeds';
const PATCHES_STORE = 'patches';
const STREAMS_STORE = 'streams';

export class IndexedDBStore implements PersistentStore {
  private _database: IDBDatabase | null = null;

  addFeed(feed: Feed): Promise<void> {
    return this._runInTransaction(
      async (feedsStore) => {
        await waitForRequest(feedsStore.put(feed));
      },
      [FEEDS_STORE],
      'readwrite',
    );
  }

  addPatches(patches: Patch[]): Promise<void> {
    return this._runInTransaction(
      async (patchesStore) => {
        for (const patch of patches) {
          await waitForRequest(patchesStore.put(patch));

          // Invalidate changes under the path.
          await waitForRequest(
            patchesStore.delete(
              IDBKeyRange.bound(
                patch.path,
                patch.path.concat([[] as any]),
                true,
                true,
              ),
            ),
          );
        }
      },
      [PATCHES_STORE],
      'readwrite',
    );
  }

  addStream(stream: Stream): Promise<void> {
    return this._runInTransaction(
      async (streamsStore) => {
        await waitForRequest(streamsStore.put(stream));
      },
      [STREAMS_STORE],
      'readwrite',
    );
  }

  deleteFeed(id: string): Promise<void> {
    return this._runInTransaction(
      async (feedsStore) => {
        await waitForRequest(feedsStore.delete(id));
      },
      [FEEDS_STORE],
      'readwrite',
    );
  }

  deleteStream(id: string): Promise<void> {
    return this._runInTransaction(
      async (streamsStore) => {
        await waitForRequest(streamsStore.delete(id));
      },
      [STREAMS_STORE],
      'readwrite',
    );
  }

  findFeed(id: string): Promise<Feed | null> {
    return this._runInTransaction(
      async (feedsStore) => {
        return (await waitForRequest(feedsStore.get(id))) ?? null;
      },
      [FEEDS_STORE],
    );
  }

  findPatches(): Promise<Patch[]> {
    return this._runInTransaction(
      async (patchesStore) => {
        const request = patchesStore.openCursor();
        const results: Patch[] = [];
        await iterateCursor(request, (cursor) => {
          results.push(cursor.value);
          cursor.continue();
        });
        return results;
      },
      [PATCHES_STORE],
    );
  }

  findStream(id: string): Promise<Stream | null> {
    return this._runInTransaction(
      async (streamsStore) => {
        return (await waitForRequest(streamsStore.get(id))) ?? null;
      },
      [STREAMS_STORE],
    );
  }

  private async _getDatabase(): Promise<IDBDatabase> {
    if (this._database === null) {
      const disconnect = () => {
        this._database = null;
      };

      this._database = await prepareDatabase();
      this._database.addEventListener('abort', disconnect);
      this._database.addEventListener('error', disconnect);
    }

    return this._database;
  }

  private async _runInTransaction<
    TResult,
    const TStoreNames extends readonly string[],
  >(
    callback: (
      ...stores: { [K in keyof TStoreNames]: IDBObjectStore }
    ) => TResult | Promise<TResult>,
    storeNames: TStoreNames,
    mode?: IDBTransactionMode,
    options?: IDBTransactionOptions,
  ): Promise<TResult> {
    const database = await this._getDatabase();
    const transaction = database.transaction(storeNames, mode, options);
    const stores = storeNames.map((storeName) =>
      transaction.objectStore(storeName),
    );
    const result = await callback(...(stores as any));
    await waitForTransation(transaction);
    return result;
  }
}

function iterateCursor(
  request: IDBRequest<IDBCursorWithValue | null>,
  callback: (cursor: IDBCursorWithValue) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    request.addEventListener('error', (_event) => {
      reject(request.error);
    });

    request.addEventListener('success', (_event) => {
      const cursor = request.result;
      if (cursor !== null) {
        callback(cursor);
      } else {
        resolve();
      }
    });
  });
}

function prepareDatabase(): Promise<IDBDatabase> {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = (_event) => {
    const database = request.result;

    database.createObjectStore(PATCHES_STORE, {
      keyPath: 'path',
    });

    database.createObjectStore(FEEDS_STORE, {
      keyPath: 'id',
    });

    database.createObjectStore(STREAMS_STORE, {
      keyPath: 'id',
    });
  };

  return waitForRequest(request);
}

function waitForRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (request.readyState === 'done') {
      resolve(request.result);
    } else {
      request.addEventListener('error', () => {
        reject(request.error);
      });

      request.addEventListener('success', () => {
        resolve(request.result);
      });
    }
  });
}

function waitForTransation(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('error', () => {
      reject(transaction.error);
    });

    transaction.addEventListener('abort', () => {
      resolve();
    });

    transaction.addEventListener('complete', () => {
      resolve();
    });
  });
}
