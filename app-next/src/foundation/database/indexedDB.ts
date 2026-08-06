import type { ObjectStoreManager, UseStoreMap } from './types.ts';

export type IDBStoreMap = Record<
  string,
  {
    new (store: IDBObjectStore): object;
    migrate(
      database: IDBDatabase,
      name: string,
      oldVersin: number,
      newVersion: number | null,
    ): void;
  }
>;

export abstract class IDBGenericStore<T extends object> {
  static migrate(
    database: IDBDatabase,
    name: string,
    _oldVersin: number,
    _newVersion: number | null,
  ): void {
    database.createObjectStore(name, {
      keyPath: 'id',
    });
  }

  protected readonly _store: IDBObjectStore;

  constructor(store: IDBObjectStore) {
    this._store = store;
  }

  async clear(): Promise<void> {
    const request = this._store.clear();
    await waitForRequest(request);
  }

  async delete(id: string): Promise<void> {
    const request = this._store.delete(id);
    await waitForRequest(request);
  }

  async get(id: string): Promise<T | undefined> {
    const request = this._store.get(id);
    return await waitForRequest(request);
  }

  async getAll(): Promise<T[]> {
    const request = this._store.getAll();
    return await waitForRequest(request);
  }

  async put(object: T): Promise<void> {
    const request = this._store.put(object);
    await waitForRequest(request);
  }
}

export class IDBObjectStoreManager<TStoreMap extends IDBStoreMap>
  implements ObjectStoreManager<TStoreMap>
{
  private readonly _database: IDBDatabase;
  private readonly _storeMap: TStoreMap;

  static async open<TStoreMap extends IDBStoreMap>(
    name: string,
    version: number,
    storeMap: TStoreMap,
  ): Promise<IDBObjectStoreManager<TStoreMap>> {
    const request = indexedDB.open(name, version);

    request.addEventListener('upgradeneeded', (event) => {
      for (const name in storeMap) {
        storeMap[name]!.migrate(
          request.result,
          name,
          event.oldVersion,
          event.newVersion,
        );
      }
    });

    const database = await waitForRequest(request);

    return new IDBObjectStoreManager(database, storeMap);
  }

  constructor(database: IDBDatabase, storeMap: TStoreMap) {
    this._database = database;
    this._storeMap = storeMap;
  }

  async runTransaction<const TStoreNames extends (keyof TStoreMap)[], TReturn>(
    storeNames: TStoreNames,
    callback: (stores: UseStoreMap<TStoreMap, TStoreNames>) => Promise<TReturn>,
    options: IDBTransactionOptions & { mode?: IDBTransactionMode } = {},
  ): Promise<TReturn> {
    const transaction = this._database.transaction(
      storeNames as string[],
      options.mode,
      options,
    );

    try {
      const stores = {} as Record<string, object>;
      for (const storeName of storeNames as string[]) {
        const Store = this._storeMap[storeName]!;
        stores[storeName] = new Store(transaction.objectStore(storeName));
      }
      const returnValue = await callback(
        stores as UseStoreMap<TStoreMap, TStoreNames>,
      );
      transaction.commit();
      return returnValue;
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }
}

export function waitForRequest<T>(request: IDBRequest<T>): Promise<T> {
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
