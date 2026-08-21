import { createComponent, html } from 'barebind';
import { HashAdapter, SyncNavigation } from 'barebind/addons/router';
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
  const [page] = this.use(
    AsyncResource(
      async (url, _reload, signal) => {
        const loader = router.match(url);
        return loader !== undefined
          ? (await loader(store, signal)).withKey(scene.url)
          : html`Not Found`;
      },
      [scene.url],
    ),
  );
  const sidebar = Sidebar({ scene });

  return ReaderLayout({ page, sidebar });
});
