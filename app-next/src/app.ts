import { FeedlyClient } from '@feedpon/feedly-client';
import { DOMAdapter, DOMRoot, Runtime } from 'barebind';
import { HashAdapter } from 'barebind/addons/router';
import { UpdateLogger } from 'barebind/addons/update-logger';
import { UpdateProfiler } from 'barebind/addons/update-profiler';
import { ChromeAuthenticator } from './foundation/authenticator/chrome.ts';
import { IDBObjectStoreManager } from './foundation/database/indexed-db.ts';
import { Mutex } from './foundation/mutex.ts';
import { PersistentPlugin } from './foundation/store/persistent.ts';
import { AppState, AppStore, AppStoreMap } from './state/store.ts';
import { App } from './ui/app.ts';
import { createRouter } from './ui/router.ts';

const DB_NAME = 'feedpon';
const DB_VERSION = 1;
const STORE_VERSION = 1;

async function prepareStore(): Promise<AppStore> {
  const objectStoreManager = await IDBObjectStoreManager.open(
    DB_NAME,
    DB_VERSION,
    AppStoreMap,
  );
  const store = new AppStore(new AppState(), {
    authMutex: new Mutex(),
    authenticator: new ChromeAuthenticator(),
    feedlyClient: new FeedlyClient({
      baseUrl: 'https://cloud.feedly.com',
      clientId: 'feedly',
      clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
      scope: 'https://cloud.feedly.com/subscriptions',
      redirectUrl: 'https://feedly.com/feedly.html',
    }),
    objectStoreManager,
  });
  await store.use(new PersistentPlugin(objectStoreManager, STORE_VERSION));
  return store;
}

const runtime = new Runtime(new DOMAdapter());
const root = new DOMRoot(document.body, runtime);

runtime.use(new UpdateLogger());
runtime.use(new UpdateProfiler());

root.render(
  App({
    navigationAdapter: new HashAdapter(),
    prepareStore,
    router: createRouter(),
  }),
);
