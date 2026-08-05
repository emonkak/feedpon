import { FeedlyClient } from '@feedpon/feedly-client';
import { DOMAdapter, DOMRoot, Runtime } from 'barebind';
import { ChromeAuthenticator } from './foundation/authenticator/chrome.ts';
import { IDBObjectStoreManager } from './foundation/database/indexedDB.ts';
import { Mutex } from './foundation/mutex.ts';
import { PersistentPlugin } from './foundation/store/persistent.ts';
import { AppState, AppStore, AppStoreMap } from './state/store.ts';
import { App } from './ui/App.ts';

const DB_NAME = 'feedpon';
const DB_VERSION = 1;
const STATE_VERSION = 1;

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
  await store.use(new PersistentPlugin(objectStoreManager, STATE_VERSION));
  return store;
}

const runtime = new Runtime(new DOMAdapter());
const root = new DOMRoot(document.body, runtime);

root.render(
  App({
    prepareStore,
  }),
);
