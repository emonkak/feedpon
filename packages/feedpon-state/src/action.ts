import type { Reactive } from 'barebind/extras/reactive';

import type { FeedlyAuthenticator, FeedlyClient } from './apis/feedly.ts';
import type { HatenaBookmarkClient } from './apis/hatenaBookmark.ts';
import type { WedataClient } from './apis/wedata.ts';
import type { PersistentStore } from './persistent.ts';
import type { AppState, CommandHandler } from './state.ts';

export type AppAction<T> = (context: AppContext) => T;

export interface AppContext {
  commandHandler: CommandHandler<AppContext>;
  feedlyAuthenticator: FeedlyAuthenticator;
  feedlyClient: FeedlyClient;
  hatenaBookmarkClient: HatenaBookmarkClient;
  persistentStore: PersistentStore;
  state$: Reactive<AppState>;
  wedataClient: WedataClient;
}
