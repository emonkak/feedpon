import { createComponent, type RenderContext } from 'barebind';
import { HashHistory, ScrollRestration } from 'barebind/addons/router';
import type { AppStore } from 'feedpon-store';
import { Dispatcher } from './Dispatcher.ts';

export interface AppProps {
  prepareStore: () => Promise<AppStore>;
}

export const App = createComponent(function App(
  { prepareStore }: AppProps,
  $: RenderContext,
): unknown {
  const [store, setStore] = $.useState<AppStore | null>(null);
  const [error, setError] = $.useState<NonNullable<unknown> | null>(null);

  $.use(HashHistory());
  $.use(ScrollRestration());

  $.useEffect(() => {
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
    return $.html`
      <div class="l-boot">
        <img
          :class=${{
            'u-margin-bottom-1': true,
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

  return Dispatcher({ store });
});
