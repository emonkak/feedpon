import { createComponent, html } from 'barebind';
import { HashAdapter, SyncNavigation } from 'barebind/addons/router';
import { loadSubscriptions } from '../state/actions.ts';
import type { AppStore } from '../state/store.ts';
import { AsyncResource, mapAsyncResource } from './hooks/AsyncResource.ts';
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
  const page = this.use(
    AsyncResource(
      async (signal) => {
        const loader = router.match(scene.url);
        return loader !== undefined
          ? (await loader(store, signal)).withKey(scene.url)
          : html`Not Found`;
      },
      [scene.url],
    ),
  );
  const subscriptions = this.use(
    AsyncResource(async (signal) => {
      return store.dispatch(loadSubscriptions(signal));
    }, []),
  );
  const sidebar = this.useMemo(() => {
    return mapAsyncResource(subscriptions, (subscriptions) =>
      Sidebar({ subscriptions, scene }),
    );
  }, [subscriptions.state, scene.url]);

  return ReaderLayout({ page, sidebar });
});
