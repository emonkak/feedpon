import type { Feed, Stream } from '@feedpon/feedly-client';
import { IDBGenericStore, waitForRequest } from './database/indexedDB.ts';
import type { Patch } from './store/persistent.ts';

export class FeedStore extends IDBGenericStore<Feed> {}

export class PatchStore extends IDBGenericStore<Patch> {
  static override migrate(
    database: IDBDatabase,
    name: string,
    _oldVersin: number,
    _newVersion: number | null,
  ): void {
    database.createObjectStore(name, {
      keyPath: 'path',
    });
  }

  async invalidatePath(path: PropertyKey[]): Promise<void> {
    await waitForRequest(
      this._store.delete(IDBKeyRange.bound(path, [...path, []], true, true)),
    );
  }
}

export class StreamStore extends IDBGenericStore<Stream> {}
