import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { classMap, component, optional } from '@emonkak/ebit/directives.js';
import { hashLocation, resetScrollPosition } from '@emonkak/ebit/router.js';
import type { Store } from 'feedpon-flux';
import { setStoreHook } from 'feedpon-flux/ebit';
import type { History } from 'history';

import { Dispatch } from './Dispatch';

export interface AppProps {
  getStore: () => Promise<Store<unknown, unknown>>;
  history: History;
}

export function App(
  { getStore }: AppProps,
  context: RenderContext,
): TemplateResult {
  const [store, setStore] = context.useState<Store<unknown, unknown> | null>(
    null,
  );
  const [error, setError] = context.useState<NonNullable<unknown> | null>(null);
  const [locationState] = context.use(hashLocation);

  context.useLayoutEffect(() => {
    resetScrollPosition(locationState);
  }, [locationState]);

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
          class=${classMap({
            'animation-blinking': !error,
            'u-margin-bottom-1': true,
          })}
          src="./img/logo.svg"
          width="244"
          height="88"
        >
        <${optional(
          error !== null
            ? context.html`
              <div class="u-text-negative u-text-center">
                <p class="u-text-4">${error.toString()}</p>
              </div>
            `
            : null,
        )}>
      </div>
    `;
  }

  context.use(setStoreHook(store));

  return context.html`<${component(Dispatch, {})}>`;
}
