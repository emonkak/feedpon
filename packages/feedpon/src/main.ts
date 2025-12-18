import { BrowserBackend, Root, Runtime } from 'barebind';
import { ConsoleReporter, PerformanceProfiler } from 'barebind/extras/profiler';
import { Reactive } from 'barebind/extras/reactive';
import { type AppContext, AppStore, Lock, SmoothScroll } from 'feedpon-store';
import { FeedlyClient } from 'feedpon-store/apis/feedly';
import { HatenaBookmarkClient } from 'feedpon-store/apis/hatenaBookmark';
import { WedataClient } from 'feedpon-store/apis/wedata';
import { AppState } from 'feedpon-store/state';
import { App } from 'feedpon-view';

import { ChromeAuthenticator } from './ChromeAuthenticator.ts';
import { IndexedDBStore } from './IndexedDBStore.ts';

const context: AppContext = {
  feedlyAuthLock: new Lock(),
  feedlyAuthenticator: new ChromeAuthenticator(),
  feedlyClient: new FeedlyClient({
    baseUrl: 'https://cloud.feedly.com',
    clientId: 'feedly',
    clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
    scope: 'https://cloud.feedly.com/subscriptions',
    redirectUrl: 'https://feedly.com/feedly.html',
  }),
  hatenaBookmarkClient: new HatenaBookmarkClient(),
  stateRepository: new IndexedDBStore(),
  smoothScroll: new SmoothScroll(),
  state$: Reactive.from(new AppState()),
  wedataClient: new WedataClient(),
};
const prepareStore = async (context: AppContext): Promise<AppStore> => {
  const store = new AppStore(context);
  await store.restoreState();
  return store;
};
const runtime = new Runtime(new BrowserBackend());
const root = Root.create(
  App({ context, prepareStore }),
  document.body,
  runtime,
);

DEBUG: {
  runtime.addObserver(new PerformanceProfiler(new ConsoleReporter()));
}

root.mount();
