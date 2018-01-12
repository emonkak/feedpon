import { EventStore, Snapshot, IdentifiedEvent } from './types';

const DB_NAME = 'feedpon';
const DB_VERSION = 1;
const EVENTS_STORE_NAME = 'events';
const SNAPSHOTS_STORE_NAME = 'snapshots';

export default class IndexedDBEventStore<TState, TEvent> implements EventStore<TState, TEvent> {
    private _db: Promise<IDBDatabase> | null = null;

    saveEvents(events: IdentifiedEvent<TEvent>[]): Promise<void> {
        return this._transaction([EVENTS_STORE_NAME], 'readwrite', (transaction) => {
            const transactionCompletion = promisifyTransaction(transaction);
            const eventsStore = transaction.objectStore(EVENTS_STORE_NAME);

            for (const event of events) {
                eventsStore.put(event);
            }

            return transactionCompletion;
        });
    }

    saveSnapshot(snapshot: Snapshot<TState>): Promise<void> {
        return this._transaction([SNAPSHOTS_STORE_NAME, EVENTS_STORE_NAME], 'readwrite', (transaction) => {
            const transactionCompletion = promisifyTransaction(transaction);
            const snapshotsStore = transaction.objectStore(SNAPSHOTS_STORE_NAME);
            const eventsStore = transaction.objectStore(EVENTS_STORE_NAME);
            snapshotsStore.clear();
            snapshotsStore.add(snapshot);
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
        return this._transaction([SNAPSHOTS_STORE_NAME], 'readonly', async (transaction) => {
            const snapshotsStore = transaction.objectStore(SNAPSHOTS_STORE_NAME);
            const request = snapshotsStore.openCursor(undefined, 'prev');
            const cursor = await promisifyRequest<IDBCursorWithValue | null>(request);
            return cursor ? cursor.value : null;
        });
    }

    private async _getDatabase(): Promise<IDBDatabase> {
        if (!this._db) {
            this._db = openDatabase();
        }

        try {
            return await this._db;
        } catch (e) {
            this._db = null;
            throw e;
        }
    }

    private async _transaction<T>(storeNames: string[], mode: IDBTransactionMode, callback: (transaction: IDBTransaction) => Promise<T>): Promise<T> {
        const db = await this._getDatabase();
        const transaction = db.transaction(storeNames, mode);
        return callback(transaction);
    }
}

async function openDatabase(): Promise<IDBDatabase> {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
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
            request.addEventListener('error', (event) => {
                reject(request.error);
            });

            request.addEventListener('success', (event) => {
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

        transaction.addEventListener('abort', (event) => {
            resolve();
        });

        transaction.addEventListener('complete', (event) => {
            resolve();
        });
    });
}

function getValuesForCursorRequest<T>(request: IDBRequest): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const results: T[] = [];

        request.addEventListener('error', (event) => {
            reject(request.error);
        });

        request.addEventListener('success', (event) => {
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
