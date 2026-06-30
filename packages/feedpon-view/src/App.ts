import { createComponent, html } from 'barebind';
import { HashAdapter, Navigation } from 'barebind/addons/router';
import type { AppStore } from 'feedpon-store';
import { Dispatcher } from './Dispatcher.ts';

export interface AppProps {
  prepareStore: () => Promise<AppStore>;
}

export const App = createComponent<AppProps>(function App({ prepareStore }) {
  const [store, setStore] = this.useState<AppStore | null>(null);
  const [error, setError] = this.useState<NonNullable<unknown> | null>(null);

  this.use(Navigation(new HashAdapter()));

  this.useEffect(() => {
    prepareStore().then(
      (store) => {
        setStore(store);
      },
      (error) => {
        console.error(error);
        setError(error);
      },
    );
  }, [prepareStore]);

  if (store === null) {
    return html`
      <div class="l-boot">
        <img
          class=${{
            'u-margin-bottom-1': true,
            'animation-blinking': !error,
          }}
          src="./img/logo.svg"
          width="244"
          height="88"
        >
        <${
          error !== null
            ? html`
              <div class="u-text-negative u-text-center">
                <p class="u-text-4">${error.toString()}</p>
              </div>
            `
            : null
        }>
      </div>
    `;
  }

  return Dispatcher({ store });
});
