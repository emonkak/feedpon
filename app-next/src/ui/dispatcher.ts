import { createComponent, html } from 'barebind';
import { HashAdapter, SyncNavigation } from 'barebind/addons/router';
import type { AppStore } from '../state/store.ts';
import { AsyncResource } from './hooks/async-resource.ts';
import { ReaderLayout } from './layouts/reader-layout.ts';
import { router } from './router.ts';
import { Sidenav } from './sidenav/sidenav.ts';
import { Sidetoc } from './sidetoc/sidetoc.ts';

export interface DispatcherProps {
  store: AppStore;
}

export const Dispatcher = createComponent(function Dispatcher({
  store,
}: DispatcherProps) {
  const { scene } = this.use(SyncNavigation(new HashAdapter()));
  const [page] = this.use(
    AsyncResource(
      async (url, signal) => {
        const loader = router.match(url);
        return loader !== undefined
          ? (await loader(store, signal)).withKey(scene.url)
          : html`${scene.url}`;
      },
      [scene.url],
    ),
  );
  const sidenav = Sidenav({ scene });
  const sidetoc = Sidetoc({ scene });

  return ReaderLayout({ page, sidenav, sidetoc });
});
