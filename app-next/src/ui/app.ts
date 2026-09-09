import { createComponent } from 'barebind';
import type { NavigationAdapter } from 'barebind/addons/router';
import type { Router } from 'barebind/addons/router/router';
import { CentralClock } from '../foundation/central-clock.ts';
import type { AppStore } from '../state/store.ts';
import { AuthGuard } from './auth/auth-guard.ts';
import { Dispatcher } from './dispatcher.ts';
import { BootLayout } from './layouts/boot-layout.ts';
import type { PageLoader } from './router.ts';

export interface AppProps {
  navigationAdapter: NavigationAdapter;
  router: Router<PageLoader>;
  prepareStore: () => Promise<AppStore>;
}

export const App = createComponent(function App({
  navigationAdapter,
  router,
  prepareStore,
}: AppProps) {
  const [store, setStore] = this.useState<AppStore | null>(null);

  this.useEffect(() => {
    prepareStore().then((store) => {
      setStore(store);
    });
  }, [prepareStore]);

  if (store === null) {
    return BootLayout({ message: 'Initializing application...' });
  }

  this.provide(store);
  this.provide(new CentralClock(60 * 1000));
  this.provide(new Intl.DateTimeFormat());
  this.provide(
    new Intl.RelativeTimeFormat(undefined, {
      numeric: 'auto',
      style: 'narrow',
    }),
  );

  return AuthGuard({
    children: Dispatcher({ navigationAdapter, router, store }),
    store,
  });
});
