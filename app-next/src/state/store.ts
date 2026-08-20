import type { FeedlyClient } from '@feedpon/feedly-client';
import type { Authenticator } from '../foundation/authenticator/types.ts';
import type { IDBStoreMap } from '../foundation/database/indexedDB.ts';
import type { ObjectStoreManager } from '../foundation/database/types.ts';
import type { Mutex } from '../foundation/mutex.ts';
import { type Action, Store } from '../foundation/store/store.ts';
import {
  FeedStore,
  PatchStore,
  SessionStore,
  StreamStore,
  SubscriptionStore,
} from './database.ts';

export type AppAction<TResult> = Action<AppState, AppContext, TResult>;

export interface AppContext {
  authMutex: Mutex;
  authenticator: Authenticator;
  feedlyClient: FeedlyClient;
  objectStoreManager: ObjectStoreManager<AppStoreMap>;
}

export class AppState {
  credential: Credential | null = null;
  serverState: ServerState = {
    lastSynced: -1,
  };
  session: Session | null = null;
}

export class AppStore extends Store<AppState, AppContext> {}

export const AppStoreMap = {
  feeds: FeedStore,
  patches: PatchStore,
  sessions: SessionStore,
  streams: StreamStore,
  subscriptions: SubscriptionStore,
} as const satisfies IDBStoreMap;

export type AppStoreMap = typeof AppStoreMap;

export interface Credential {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshed: number;
}

export interface ServerState {
  lastSynced: number;
}

export interface Session {
  id: string;
  index: number;
  started: number;
}
