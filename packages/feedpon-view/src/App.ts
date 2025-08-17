import { createComponent, type RenderContext } from 'barebind';
import { HashHistory, ScrollRestration } from 'barebind/extras/router';
import type { Store } from 'feedpon-flux';
import { setStoreHook } from 'feedpon-flux/barebind.ts';

import { Dispatcher } from './Dispatcher.ts';

export interface AppProps {
  getStore: () => Promise<Store<unknown, unknown>>;
}

export const App = createComponent(function App(
  { getStore }: AppProps,
  $: RenderContext,
): unknown {
  const [store, setStore] = $.useState<Store<unknown, unknown> | null>(null);
  const [error, setError] = $.useState<NonNullable<unknown> | null>(null);

  $.use(HashHistory);
  $.use(ScrollRestration);

  $.useEffect(() => {
    getStore().then(
      (store) => {
        setStore(store);
      },
      (error) => {
        console.error(error);
        setError(error);
      },
    );
  }, [getStore]);

  if (store === null) {
    return $.html`
      <div class="l-boot">
        <img
          :class=${{
            _: 'u-margin-bottom-1',
            'animation-blinking': !error,
          }}
          src="./img/logo.svg"
          width="244"
          height="88"
        >
        <${
          error !== null
            ? $.html`
              <div class="u-text-negative u-text-center">
                <p class="u-text-4">${error.toString()}</p>
              </div>
            `
            : null
        }>
      </div>
    `;
  }

  $.use(setStoreHook(store));

  return Dispatcher({});
});
