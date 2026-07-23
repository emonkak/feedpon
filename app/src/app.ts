import { FeedlyClient } from '@feedpon/feedly-client';
import { Mutex, PersistentPlugin } from '@feedpon/foundation';
import { HatenaBookmarkClient } from '@feedpon/hatena-bookmark-client';
import { type AppContext, AppState, AppStore } from '@feedpon/model';
import { App } from '@feedpon/view';
import { WedataClient } from '@feedpon/wedata-client';
import { DOMAdapter, DOMRoot, Runtime } from 'barebind';
import { Derivable } from 'barebind/addons/signal';
import { UpdateLogger } from 'barebind/addons/update-logger';
import { UpdateProfiler } from 'barebind/addons/update-profiler';
import { ChromeAuthenticator } from './ChromeAuthenticator.ts';
import { ErrorHandlerMiddleware } from './ErrorHandlerMiddleware.ts';
import { IndexedDBStateRepository } from './IndexedDBStateRepository.ts';
import { SmoothScrollController } from './SmoothScrollController.ts';

const prepareStore = async (): Promise<AppStore> => {
  const state = Derivable.from(new AppState());
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
    state$: Derivable.from(new AppState()),
    wedataClient: new WedataClient(),
  };
  const store = new AppStore(state, context);
  await store.use(new PersistentPlugin(context.stateRepository, 1));
  store.use(new ErrorHandlerMiddleware());
  return store;
};
const runtime = new Runtime(new DOMAdapter());
const root = new DOMRoot(document.body, runtime);

DEBUG: {
  runtime.use(new UpdateLogger());
  runtime.use(new UpdateProfiler());
}

root.render(App({ prepareStore }));
