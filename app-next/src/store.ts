import type { FeedlyClient } from '@feedpon/feedly-client';
import type { Authenticator } from './authenticator/types.ts';
import type { IDBStoreMap } from './database/indexedDB.ts';
import type { ObjectStoreManager } from './database/types.ts';
import { FeedStore, PatchStore, StreamStore } from './database.ts';
import { type Action, Store } from './store/store.ts';

export type AppAction<TResult> = Action<AppState, AppContext, TResult>;

export interface AppContext {
  authenticator: Authenticator;
  feedlyClient: FeedlyClient;
  objectStoreManager: ObjectStoreManager<AppStoreMap>;
}

export class AppState {
  credential: Credential | null = null;
}

export class AppStore extends Store<AppState, AppContext> {}

export const AppStoreMap = {
  feeds: FeedStore,
  patches: PatchStore,
  streams: StreamStore,
} as const satisfies IDBStoreMap;

export type AppStoreMap = typeof AppStoreMap;

export interface Credential {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshedAt: number;
}
