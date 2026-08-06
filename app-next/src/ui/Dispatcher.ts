import { createComponent } from 'barebind';
import { HashAdapter, SyncNavigation } from 'barebind/addons/router';
import { loadSubscriptions } from '../state/actions.ts';
import type { AppStore } from '../state/store.ts';
import { AuthPage } from './auth/AuthPage.ts';
import { AsyncResource } from './hooks/AsyncResource.ts';
import { ReaderLayout } from './layout/ReaderLayout.ts';
import { router } from './router.ts';
import { Sidebar } from './sidebar/Sidebar.ts';

export interface DispatcherProps {
  store: AppStore;
}

export const Dispatcher = createComponent(function Dispatcher({
  store,
}: DispatcherProps) {
  const isAuthenticated = this.use(
    store.state$.get('credential').map((credential) => credential !== null),
  );
  const { scene } = this.use(SyncNavigation(new HashAdapter()));
  const main = this.use(
    AsyncResource(
      async (signal) => {
        if (isAuthenticated) {
          const loader = router.match(scene.url);
          if (loader !== undefined) {
            return loader(store, signal);
          }
        }
        return null;
      },
      [isAuthenticated, scene.url],
    ),
  );
  const sidebar = this.use(
    AsyncResource(
      async (signal) => {
        if (isAuthenticated) {
          const subscriptions = await store.dispatch(loadSubscriptions(signal));
          return Sidebar({
            subscriptions,
          });
        }
        return null;
      },
      [isAuthenticated],
    ),
  );

  this.provide(store);

  if (isAuthenticated) {
    return ReaderLayout({ main, sidebar });
  } else {
    return AuthPage({});
  }
});
