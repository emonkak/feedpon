import { BrowserBackend, Root, Runtime } from 'barebind';
import { DevToolsProfiler } from 'barebind/addons/dev-tools-profiler';
import {
  ConsoleReporter,
  SessionProfiler,
} from 'barebind/addons/session-profiler';
import { Reactive } from 'barebind/addons/signal';
import { type AppContext, AppState, AppStore } from 'feedpon-store';
import { FeedlyClient } from 'feedpon-store/apis/feedly';
import { HatenaBookmarkClient } from 'feedpon-store/apis/hatenaBookmark';
import { WedataClient } from 'feedpon-store/apis/wedata';
import { App } from 'feedpon-view';
import { Mutex } from 'store';
import {
  PersistentMiddleware,
  restoreState,
} from 'store/middlewares/PersistenceMiddleware';
import { ChromeAuthenticator } from './ChromeAuthenticator.ts';
import { ErrorHandlerMiddleware } from './ErrorHandlerMiddleware.ts';
import { IndexedDBStateRepository } from './IndexedDBStateRepository.ts';
import { SmoothScrollController } from './SmoothScrollController.ts';

const prepareStore = async (): Promise<AppStore> => {
  const state = Reactive.from(new AppState());
  const context: AppContext = {
    feedlyAuthMutex: new Mutex(),
    feedlyAuthenticator: new ChromeAuthenticator(),
    feedlyClient: new FeedlyClient({
      baseUrl: 'https://cloud.feedly.com',
      clientId: 'feedly',
      clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
      scope: 'https://cloud.feedly.com/subscriptions',
      redirectUrl: 'https://feedly.com/feedly.html',
    }),
    hatenaBookmarkClient: new HatenaBookmarkClient(),
    scrollController: new SmoothScrollController(),
    stateRepository: new IndexedDBStateRepository(),
    state$: Reactive.from(new AppState()),
    wedataClient: new WedataClient(),
  };
  const store = new AppStore(state, context);
  await store.dispatch(restoreState());
  return store
    .with(new PersistentMiddleware())
    .with(new ErrorHandlerMiddleware());
};
const runtime = new Runtime(new BrowserBackend());
const root = Root.create(App({ prepareStore }), document.body, runtime);

DEBUG: {
  runtime.addObserver(new SessionProfiler(new ConsoleReporter()));
  runtime.addObserver(new DevToolsProfiler());
}

root.mount();
