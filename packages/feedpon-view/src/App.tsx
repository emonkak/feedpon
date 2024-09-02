import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { classMap, optional } from '@emonkak/ebit/directives.js';
import type { History } from 'history';
import React from 'react';
import { Router } from 'react-router';

import type { Store } from 'feedpon-flux';
import StoreContext from 'feedpon-flux/react/StoreContext';
import Routes from './Routes';
import { reactElement } from './directives/reactElement';

export interface AppProps {
  preparingStore: Promise<Store<unknown, unknown>>;
  history: History;
}

export function App(
  { preparingStore, history }: AppProps,
  context: RenderContext,
): TemplateResult {
  const [store, setStore] = context.useState<Store<unknown, unknown> | null>(
    null,
  );
  const [error, setError] = context.useState<NonNullable<unknown> | null>(null);

  context.useEffect(() => {
    preparingStore.then(
      (store) => {
        setStore(store);
      },
      (error) => {
        console.error(error);
        setError(error);
      },
    );
  }, []);

  if (store !== null) {
    return context.html`<${reactElement(
      <StoreContext.Provider value={store}>
        <Router history={history}>
          <Routes history={history} />
        </Router>
      </StoreContext.Provider>,
    )}>`;
  } else {
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
}
