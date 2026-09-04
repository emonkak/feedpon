import type {
  FeedlyClient,
  Subscription,
  UnreadCount,
} from '@feedpon/feedly-client';
import type { Authenticator } from '../foundation/authenticator/types.ts';
import type { IDBStoreMap } from '../foundation/database/indexed-db.ts';
import type { ObjectStoreManager } from '../foundation/database/types.ts';
import type { Mutex } from '../foundation/mutex.ts';
import { type Action, Store } from '../foundation/store/store.ts';
import {
  FeedStore,
  PatchStore,
  SessionStore,
  StreamStore,
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
    version: 0,
  };
  session: Session | null = null;
  subscriptions: Subscription[] = [];
  unreadCounts: UnreadCount[] = [];
}

export class AppStore extends Store<AppState, AppContext> {}

export const AppStoreMap = {
  feeds: FeedStore,
  patches: PatchStore,
  sessions: SessionStore,
  streams: StreamStore,
} as const satisfies IDBStoreMap;

export type AppStoreMap = typeof AppStoreMap;

export interface Credential {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshed: number;
}

export interface Session {
  id: string;
  version: number;
  scrollIndex: number;
}

export interface ServerState {
  lastSynced: number;
  version: number;
}
