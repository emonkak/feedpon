import { createComponent, html } from 'barebind';
import type {
  NavigationAdapter,
  NavigationScene,
  Router,
} from 'barebind/addons/router';
import type { AppStore } from '../state/store.ts';
import { AsyncResource } from './hooks/async-resource.ts';
import { ReaderLayout } from './layouts/reader-layout.ts';
import type { PageLoader } from './router.ts';
import { Sidenav } from './sidenav/sidenav.ts';
import { Sidetoc } from './sidetoc/sidetoc.ts';

export interface DispatcherProps {
  navigationAdapter: NavigationAdapter;
  router: Router<PageLoader>;
  store: AppStore;
}

export const Dispatcher = createComponent(function Dispatcher({
  navigationAdapter,
  router,
  store,
}: DispatcherProps) {
  const [scene, setScene] = this.useState<NavigationScene>(() => ({
    url: navigationAdapter.getCurrentURL(),
    state: navigationAdapter.getCurrentState(),
    navigationType: null,
  }));
  const [page, refetchPage, isPending] = this.use(
    AsyncResource(scene.url, async (url, signal) => {
      const loader = router.match(url);
      return loader !== undefined
        ? (await loader(store, signal)).withKey(scene.url)
        : html`${scene.url}`;
    }),
  );

  this.useEffect(() => {
    return navigationAdapter.listen((scene, interceptor) => {
      interceptor.intercept({
        async handler() {
          const handle = await refetchPage(scene.url, interceptor.signal);
          await Promise.all([handle.finished, setScene(scene).finished]);
        },
        scroll: 'manual',
      });
    });
  }, [navigationAdapter]);

  return ReaderLayout({
    isPending,
    page,
    sidenav: Sidenav({ scene }),
    sidetoc: Sidetoc({ scene }),
  });
});
