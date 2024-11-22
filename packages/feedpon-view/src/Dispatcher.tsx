import type { RenderContext, TemplateResult, Usable } from '@emonkak/ebit';
import { component, optional } from '@emonkak/ebit/directives.js';
import { currentLocation } from '@emonkak/ebit/router.js';
import { getStoreHook } from 'feedpon-flux/ebit';
import type { State, Store, ThemeKind } from 'feedpon-messaging';
import { THEMES } from 'feedpon-messaging/ui';

import { AuthenticationPage } from './authentication/AuthenticationPage';
import { SidebarLayout } from './layouts/SidebarLayout';
import { SingleLayout } from './layouts/SingleLayout';
import { router } from './router';

export interface DispatcherProps {}

export function Dispatcher(
  _props: DispatcherProps,
  context: RenderContext,
): TemplateResult {
  const { store, customStyles, isAuthenticated, theme } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        customStyles: state.ui.customStyles,
        isAuthenticated: !!state.backend.token,
        theme: state.ui.theme,
      }),
      mapStoreToProps: (store) => ({ store: store as Store }),
    }),
  );
  const [locationState, locationActions] = context.use(currentLocation);

  context.use(styleHook(customStyles));
  context.use(themeHook(theme));

  if (!isAuthenticated) {
    return context.html`<${component(SingleLayout, {
      child: component(AuthenticationPage, {}),
    })}>`;
  }

  const child = optional(
    router.handle(locationState.url, { locationActions, store }),
  );

  return context.html`<${component(SidebarLayout, {
    child,
  })}>`;
}

function styleHook(rule: string): Usable<void> {
  return (context) => {
    context.useInsertionEffect(() => {
      const style = document.createElement('style');

      document.body.append(style);

      if (rule !== '') {
        style.sheet!.insertRule(rule);
      }

      return () => {
        document.body.removeChild(style);
      };
    }, [rule]);
  };
}

function themeHook(theme: ThemeKind): Usable<void> {
  return (context) => {
    context.useLayoutEffect(() => {
      for (const THEME of THEMES) {
        if (THEME.value !== theme) {
          document.body.classList.remove(THEME.value);
        }
      }

      document.body.classList.add(theme);

      return () => {
        document.body.classList.remove(theme);
      };
    }, [theme]);
  };
}
