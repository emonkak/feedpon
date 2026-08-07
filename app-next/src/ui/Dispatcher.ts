import { createComponent } from 'barebind';
import { HashAdapter, SyncNavigation } from 'barebind/addons/router';
import { loadSubscriptions } from '../state/actions.ts';
import type { AppStore } from '../state/store.ts';
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
  const { scene } = this.use(SyncNavigation(new HashAdapter()));
  const main = this.use(
    AsyncResource(
      (signal) => {
        const loader = router.match(scene.url);
        return loader !== undefined
          ? loader(store, signal)
          : Promise.resolve(null);
      },
      [scene.url],
    ),
  );
  const sidebar = this.use(
    AsyncResource(async (signal) => {
      const subscriptions = await store.dispatch(loadSubscriptions(signal));
      return Sidebar({
        subscriptions,
      });
    }, []),
  );

  this.provide(store);

  return ReaderLayout({ main, sidebar });
});
