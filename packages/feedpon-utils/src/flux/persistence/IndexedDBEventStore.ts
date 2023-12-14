import { EventStore, Snapshot, IdentifiedEvent } from './types';

const DB_NAME = 'feedpon';
const DB_VERSION = 1;
const EVENTS_STORE_NAME = 'events';
const SNAPSHOTS_STORE_NAME = 'snapshots';

export default class IndexedDBEventStore<TState, TEvent>
  implements EventStore<TState, TEvent>
{
  private _db: IDBDatabase | null = null;

  saveEvents(events: IdentifiedEvent<TEvent>[]): Promise<void> {
    return this._transaction(
      [EVENTS_STORE_NAME],
      'readwrite',
      (transaction) => {
        const transactionCompletion = promisifyTransaction(transaction);
        const eventsStore = transaction.objectStore(EVENTS_STORE_NAME);

        for (const event of events) {
          eventsStore.put(event);
        }

        return transactionCompletion;
      },
    );
  }

  async saveSnapshot(snapshot: Snapshot<TState>): Promise<void> {
    // Can't handle multiple object stores on iOS 9
    // https://bugs.webkit.org/show_bug.cgi?id=136937
    await this._transaction(
      [SNAPSHOTS_STORE_NAME],
      'readwrite',
      (transaction) => {
        const transactionCompletion = promisifyTransaction(transaction);
        const snapshotsStore = transaction.objectStore(SNAPSHOTS_STORE_NAME);
        snapshotsStore.clear();
        snapshotsStore.add(snapshot);
        return transactionCompletion;
      },
    );
    await this._transaction([EVENTS_STORE_NAME], 'readwrite', (transaction) => {
      const transactionCompletion = promisifyTransaction(transaction);
      const eventsStore = transaction.objectStore(EVENTS_STORE_NAME);
      eventsStore.delete(IDBKeyRange.upperBound(snapshot.version));
      return transactionCompletion;
    });
  }

  restoreUnappliedEvents(version: number): Promise<IdentifiedEvent<TEvent>[]> {
    return this._transaction([EVENTS_STORE_NAME], 'readonly', (transaction) => {
      const store = transaction.objectStore(EVENTS_STORE_NAME);
      const request = store.openCursor(IDBKeyRange.lowerBound(version, true));
      return getValuesForCursorRequest(request);
    });
  }

  restoreLatestSnapshot(): Promise<Snapshot<TState> | null> {
    return this._transaction(
      [SNAPSHOTS_STORE_NAME],
      'readonly',
      async (transaction) => {
        const snapshotsStore = transaction.objectStore(SNAPSHOTS_STORE_NAME);
        const request = snapshotsStore.openCursor(undefined, 'prev');
        const cursor = await promisifyRequest<IDBCursorWithValue | null>(
          request,
        );
        return cursor ? cursor.value : null;
      },
    );
  }

  private async _getDatabase(): Promise<IDBDatabase> {
    if (this._db) {
      return this._db;
    }

    const db = await openDatabase();

    db.addEventListener('abort', this._disconnect);
    db.addEventListener('error', this._disconnect);

    return (this._db = db);
  }

  private async _transaction<T>(
    storeNames: string[],
    mode: IDBTransactionMode,
    callback: (transaction: IDBTransaction) => Promise<T>,
  ): Promise<T> {
    const db = await this._getDatabase();
    const transaction = db.transaction(storeNames, mode);
    return callback(transaction);
  }

  private _disconnect = (): void => {
    this._db = null;
  };
}

function openDatabase(): Promise<IDBDatabase> {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = (_event) => {
    const db = request.result as IDBDatabase;
    db.createObjectStore(EVENTS_STORE_NAME, { keyPath: 'id' });
    db.createObjectStore(SNAPSHOTS_STORE_NAME, { keyPath: 'version' });
  };

  return promisifyRequest<IDBDatabase>(request);
}

function promisifyRequest<T>(request: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    if (request.readyState === 'done') {
      resolve(request.result);
    } else {
      request.addEventListener('error', (_event) => {
        reject(request.error);
      });

      request.addEventListener('success', (_event) => {
        resolve(request.result);
      });
    }
  });
}

function promisifyTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('error', (event) => {
      reject((event.target as IDBRequest).error);
    });

    transaction.addEventListener('abort', (_event) => {
      resolve();
    });

    transaction.addEventListener('complete', (_event) => {
      resolve();
    });
  });
}

function getValuesForCursorRequest<T>(request: IDBRequest): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];

    request.addEventListener('error', (_event) => {
      reject(request.error);
    });

    request.addEventListener('success', (_event) => {
      const cursor: IDBCursorWithValue = request.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    });
  });
}
