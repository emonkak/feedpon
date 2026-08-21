import { createComponent, html } from 'barebind';
import { HashAdapter, SyncNavigation } from 'barebind/addons/router';
import type { AppStore } from '../state/store.ts';
import { AsyncResource } from './hooks/AsyncResource.ts';
import { router } from './router.ts';
import { ReaderScreen } from './screens/ReaderScreen.ts';
import { Sidenav } from './sidenav/Sidenav.ts';
import { Sidetoc } from './sidetoc/Sidetoc.ts';

export interface DispatcherProps {
  store: AppStore;
}

export const Dispatcher = createComponent(function Dispatcher({
  store,
}: DispatcherProps) {
  const { scene } = this.use(SyncNavigation(new HashAdapter()));
  const [page] = this.use(
    AsyncResource(
      async (url, { signal }) => {
        const loader = router.match(url);
        return loader !== undefined
          ? (await loader(store, signal)).withKey(scene.url)
          : html`Not Found`;
      },
      [scene.url],
    ),
  );
  const sidenav = Sidenav({ scene });
  const sidetoc = Sidetoc({ scene });

  return ReaderScreen({ page, sidenav, sidetoc });
});
