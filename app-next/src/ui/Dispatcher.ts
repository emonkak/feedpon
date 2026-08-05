import { createComponent, html, type VElement } from 'barebind';
import { HashAdapter, SyncNavigation } from 'barebind/addons/router';
import { loadSubscriptions } from '../state/actions.ts';
import type { AppStore } from '../state/store.ts';
import { AuthPage } from './AuthPage.ts';
import { router } from './router.ts';
import { Sidebar } from './Sidebar.ts';

export interface DispatcherProps {
  store: AppStore;
}

interface AsyncPart {
  content: VElement | null;
  loading: boolean;
}

export const Dispatcher = createComponent(function Dispatcher({
  store,
}: DispatcherProps) {
  const [sidebar, setSidebar] = this.useState<AsyncPart>({
    content: null,
    loading: false,
  });
  const [page, setPage] = this.useState<AsyncPart>({
    content: null,
    loading: false,
  });
  const isAuthenticated = this.use(
    store.state$.get('credential').map((credential) => credential !== null),
  );
  const { scene } = this.use(SyncNavigation(new HashAdapter()));

  this.provide(store);

  this.useEffect(() => {
    if (isAuthenticated) {
      const controller = new AbortController();
      setSidebar((sidebar) => ({ content: sidebar.content, loading: true }));
      store.dispatch(loadSubscriptions(controller.signal)).then(
        (subscriptions) => {
          setSidebar({ content: Sidebar({ subscriptions }), loading: false });
        },
        () => {
          setSidebar((sidebar) => ({
            content: sidebar.content,
            loading: false,
          }));
        },
      );
      return () => {
        controller.abort();
      };
    } else {
      setSidebar({ content: null, loading: false });
      return undefined;
    }
  }, [isAuthenticated]);

  this.useEffect(() => {
    if (isAuthenticated) {
      const controller = new AbortController();
      const loader = router.match(scene.url);
      if (loader !== undefined) {
        setPage((page) => ({ content: page.content, loading: true }));
        loader(store, controller.signal).then(
          (content) => {
            setPage({ content, loading: false });
          },
          () => {
            setPage((page) => ({ content: page.content, loading: false }));
          },
        );
        return () => {
          controller.abort();
        };
      }
    }
    setPage({ content: null, loading: false });
    return undefined;
  }, [isAuthenticated, scene.url]);

  if (isAuthenticated) {
    return html`
      <div class=${['ReaderLayout', { loading: page.loading }]}>
        <aside class="ReaderLayout-sidebar">
          <${sidebar.content}>
        </aside>
        <main class="ReaderLayout-main">
          <${page.content}>
        </main>
      </div>
    `;
  } else {
    return AuthPage({});
  }
});
