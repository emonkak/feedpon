import { createComponent, html, type VElement } from 'barebind';
import { HashAdapter, SyncNavigation } from 'barebind/addons/router';
import type { AppStore } from '../state/store.ts';
import { AuthPage } from './AuthPage.ts';
import { router } from './router.ts';

export interface DispatcherProps {
  store: AppStore;
}

interface PageState {
  content: VElement | null;
  loading: boolean;
}

export const Dispatcher = createComponent(function Dispatcher({
  store,
}: DispatcherProps) {
  const [page, setPage] = this.useState<PageState>({
    content: null,
    loading: false,
  });
  const isAuthenticated = this.use(
    store.state$.get('credential').map((credential) => credential !== null),
  );
  const { scene } = this.use(SyncNavigation(new HashAdapter()));

  this.provide(store);

  this.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const controller = new AbortController();
    const loader = router.match(scene.url);
    if (loader === undefined) {
      setPage({ content: null, loading: false });
    } else {
      setPage((page) => ({ content: page.content, loading: true }));
      loader(store, controller.signal).then((content) => {
        setPage({ content, loading: true });
      });
    }
    return () => {
      controller.abort();
    };
  }, [isAuthenticated, scene.url]);

  if (!isAuthenticated) {
    return AuthPage({});
  } else {
    const content = page.content ?? html`Not Found.`;
    return html`
      <main class=${['Dispatcher', { loading: page.loading }]}>
        <${content}>
      </main>
    `;
  }
});
