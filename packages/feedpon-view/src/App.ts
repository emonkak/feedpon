import { component, type RenderContext } from 'barebind';
import { HashHistory, ScrollRestration } from 'barebind/extensions/router';
import type { Store } from 'feedpon-flux';
import { setStoreHook } from 'feedpon-flux/barebind.ts';

import { Dispatcher } from './Dispatcher.ts';

export interface AppProps {
  getStore: () => Promise<Store<unknown, unknown>>;
}

export function App({ getStore }: AppProps, context: RenderContext): unknown {
  const [store, setStore] = context.useState<Store<unknown, unknown> | null>(
    null,
  );
  const [error, setError] = context.useState<NonNullable<unknown> | null>(null);

  context.use(HashHistory);
  context.use(ScrollRestration);

  context.useEffect(() => {
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
    return context.html`
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
            ? context.html`
              <div class="u-text-negative u-text-center">
                <p class="u-text-4">${error.toString()}</p>
              </div>
            `
            : null
        }>
      </div>
    `;
  }

  context.use(setStoreHook(store));

  return context.html`<${component(Dispatcher, {})}>`;
}
