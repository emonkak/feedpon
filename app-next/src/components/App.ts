import { createComponent, html } from 'barebind';
import type { AppStore } from '../store.ts';

export interface AppProps {
  prepareStore: () => Promise<AppStore>;
}

export const App = createComponent<AppProps>(function App({ prepareStore }) {
  const [store, setStore] = this.useState<AppStore | null>(null);

  this.useEffect(() => {
    prepareStore().then((store) => {
      setStore(store);
    });
  }, [prepareStore]);

  if (store === null) {
    return html`<div>Preparing Store...</div>`;
  }

  this.provide(store);

  return html`
    <div>Hello, Feedpon!</div>
  `;
});
