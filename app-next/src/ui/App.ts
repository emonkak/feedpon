import { createComponent, html } from 'barebind';
import type { AppStore } from '../state/store.ts';
import { AuthGuard } from './auth/AuthGuard.ts';
import { Dispatcher } from './Dispatcher.ts';

export interface AppProps {
  prepareStore: () => Promise<AppStore>;
}

export const App = createComponent(function App({ prepareStore }: AppProps) {
  const [store, setStore] = this.useState<AppStore | null>(null);

  this.useEffect(() => {
    prepareStore().then((store) => {
      setStore(store);
    });
  }, [prepareStore]);

  if (store === null) {
    return html`<div>Preparing Store...</div>`;
  }

  return AuthGuard({ children: Dispatcher({ store }), store });
});
