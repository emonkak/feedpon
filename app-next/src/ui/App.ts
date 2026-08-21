import { createComponent } from 'barebind';
import type { AppStore } from '../state/store.ts';
import { AuthGuard } from './auth/AuthGuard.ts';
import { Dispatcher } from './Dispatcher.ts';
import { BootScreen } from './screens/BootScreen.ts';

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
    return BootScreen({ message: 'Initializing application...' });
  }

  this.provide(store);

  return AuthGuard({ children: Dispatcher({ store }), store });
});
