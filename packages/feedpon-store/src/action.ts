import type { Reactive } from 'barebind/extras/reactive';
import type { FeedlyAuthenticator, FeedlyClient } from './apis/feedly.ts';
import type { HatenaBookmarkClient } from './apis/hatenaBookmark.ts';
import type { WedataClient } from './apis/wedata.ts';
import type { StateRepository } from './persistent.ts';
import type { AppState } from './state.ts';
import type { Lock } from './utils/Lock.ts';
import type { SmoothScroll } from './utils/SmoothScroll.ts';

export type AppAction<T> = (context: AppContext) => T;

export interface AppContext {
  feedlyAuthLock: Lock;
  feedlyAuthenticator: FeedlyAuthenticator;
  feedlyClient: FeedlyClient;
  hatenaBookmarkClient: HatenaBookmarkClient;
  smoothScroll: SmoothScroll;
  state$: Reactive<AppState>;
  stateRepository: StateRepository;
  wedataClient: WedataClient;
}
