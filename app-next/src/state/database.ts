import type { Feed, Stream } from '@feedpon/feedly-client';
import { IDBGenericStore } from '../foundation/database/indexed-db.ts';
import type { Patch } from '../foundation/store/persistent.ts';
import type { Session } from './store.ts';

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
}

export class SessionStore extends IDBGenericStore<Session> {}

export class StreamStore extends IDBGenericStore<Stream> {
  static override migrate(
    database: IDBDatabase,
    name: string,
    _oldVersin: number,
    _newVersion: number | null,
  ): void {
    database.createObjectStore(name);
  }
}
